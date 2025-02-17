import { Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, MoreThan, Repository, LessThan } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post';
import { UpdatePostDto } from './dto/update-post';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { PROTOCOL, HOST } from '../common/env.const';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
  ) {}

  async getAllPosts() {
    return this.postsRepository.find({
      relations: ['user'],
    });
  }

  /**
   * 커서 방식의 페이지네이션
   */
  async paginatePosts(dto: PaginatePostDto) {
    if (dto.page) {
      return this.pagePaginatePosts(dto);
    } else {
      return this.cursorPaginatePosts(dto);
    }
  }

  async pagePaginatePosts(dto: PaginatePostDto) {
    const [posts, count] = await this.postsRepository.findAndCount({
      skip: (dto.page - 1) * dto.take,
      take: dto.take,
      order: {
        createdAt: dto.order__createdAt,
      },
    });

    return {
      data: posts,
      total: count,
    };
  }

  async cursorPaginatePosts(dto: PaginatePostDto) {
    const where: FindOptionsWhere<PostsModel> = {};

    if (dto.where__id_less_than) {
      where.id = LessThan(dto.where__id_less_than);
    } else if (dto.where__id_more_than) {
      where.id = MoreThan(dto.where__id_more_than);
    }

    const posts = await this.postsRepository.find({
      where,
      order: {
        // dto.order__createdAt 로 정렬
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    });

    const lastPost = posts.length > 0 && posts.length === dto.take ? posts[posts.length - 1] : null;
    const nextUrl = lastPost && new URL(`${PROTOCOL}://${HOST}`);

    if (nextUrl) {
      // dto 의 값들을 추출하여 query string 생성하기
      for (const key of Object.keys(dto)) {
        if (key !== 'where__id_more_than' && key !== 'where__id_less_than') {
          nextUrl.searchParams.append(key, dto[key]);
        }
      }
      if (dto.order__createdAt === 'ASC') {
        nextUrl.searchParams.append(
          'where__id_more_than',
          lastPost.id.toString(),
        );
      } else {
        nextUrl.searchParams.append(
          'where__id_less_than',
          lastPost.id.toString(),
        );
      }
    }

    return {
      data: posts,
      count: posts.length,
      cursor: {
        after: lastPost?.id ?? null,
      },
      next: nextUrl?.toString() ?? null,
    };
  }

  async getPostById(id: string) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException('없어');
    }

    return post;
  }

  async createPost(user: number, body: CreatePostDto) {
    const post = this.postsRepository.create({
      user: {
        id: user,
      },
      title: body.title,
      content: body.content,
      likeCount: 0,
      commentCount: 0,
    });

    return await this.postsRepository.save(post);
  }

  async updatePost(id: string, body: UpdatePostDto) {
    const { title, content } = body;
    const post: PostsModel = await this.postsRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (title) {
      post.title = title;
    }
    if (content) {
      post.content = content;
    }

    return await this.postsRepository.save(post);
  }

  async deletePost(id: string) {
    const post: PostsModel = await this.postsRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return await this.postsRepository.delete(post);
  }
}
