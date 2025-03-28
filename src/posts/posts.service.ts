import { Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, MoreThan, Repository, LessThan, QueryRunner } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post';
import { UpdatePostDto } from './dto/update-post';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { CommonService } from '../common/common.service';
import { ConfigService } from '@nestjs/config';
import { ImageModel } from '../common/entities/image.entity';
import { DEFAULT_POST_FIND_OPTIONS } from './const/default-post-find-options.const';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
  ) {
  }

  async getAllPosts() {
    return this.postsRepository.find({
      relations: ['user','images'],
    });
  }

  /**
   * 커서 방식의 페이지네이션
   */
  async paginatePosts(dto: PaginatePostDto) {
    return this.commonService.paginate(dto, this.postsRepository, {
      ...DEFAULT_POST_FIND_OPTIONS,
    }, 'posts');
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

    if (dto.where__id__less_than) {
      where.id = LessThan(dto.where__id__less_than);
    } else if (dto.where__id__more_than) {
      where.id = MoreThan(dto.where__id__more_than);
    }

    const posts = await this.postsRepository.find({
      where,
      order: {
        // dto.order__createdAt 로 정렬
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    });

    const PROTOCOL = this.configService.get<string>('PROTOCOL');
    const HOST = this.configService.get<string>('HOST');
    const lastPost = posts.length > 0 && posts.length === dto.take ? posts[posts.length - 1] : null;
    const nextUrl = lastPost && new URL(`${PROTOCOL}://${HOST}`);

    if (nextUrl) {
      // dto 의 값들을 추출하여 query string 생성하기
      for (const key of Object.keys(dto)) {
        if (key !== 'where__id__more_than' && key !== 'where__id__less_than') {
          nextUrl.searchParams.append(key, dto[key]);
        }
      }
      if (dto.order__createdAt === 'ASC') {
        nextUrl.searchParams.append(
          'where__id__more_than',
          lastPost.id.toString(),
        );
      } else {
        nextUrl.searchParams.append(
          'where__id__less_than',
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

  async getPostById(id: string, queryRunner?: QueryRunner) {
    const post = await this.getPostRepository(queryRunner).findOne({
      ...DEFAULT_POST_FIND_OPTIONS,
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException('없어');
    }

    return post;
  }

  getPostRepository(queryRunner?: QueryRunner) {
    return queryRunner ? queryRunner.manager.getRepository(PostsModel) : this.postsRepository
  }

  async createPost(user: number, body: CreatePostDto, queryRunner?: QueryRunner) {
    const repository = this.getPostRepository(queryRunner);
    const post = repository.create({
      user: {
        id: user,
      },
      title: body.title,
      content: body.content,
      images: [],
      likeCount: 0,
      commentCount: 0,
    });

    return await repository.save(post);
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

    return await this.postsRepository.delete(post.id);
  }
}
