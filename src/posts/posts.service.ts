import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, MoreThan, Repository, LessThan } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post';
import { UpdatePostDto } from './dto/update-post';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { CommonService } from '../common/common.service';
import { ConfigService } from '@nestjs/config';
import { POST_IMAGE_PATH, TEMP_PUBLIC_PATH } from '../common/const/path.const';
import { join, basename } from 'path';
import * as fs from 'fs';
import { CreatePostImageDto } from './images/create-image.dto';
import { ImageModel } from '../common/entities/image.entity';

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
      relations: ['user','images'],
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

  async getPostById(id: string) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
      relations: ['user','images'],
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
      images: [],
      likeCount: 0,
      commentCount: 0,
    });

    return await this.postsRepository.save(post);
  }

  async createPostImage(dto: CreatePostImageDto) {
    //dto 이미지를 기반으로 파일 경로 생성
    //반복문으로 image 처리
    const tempFilePath = join(TEMP_PUBLIC_PATH, dto.path);
    // 트랜잭션 처리
    try {
      await fs.promises.access(tempFilePath);
    } catch (e) {
      console.log(e);
      throw new BadRequestException('파일이 존재하지 않습니다.');
    }

    const fileName = basename(tempFilePath);

    const newPath = join(POST_IMAGE_PATH, fileName);

    //파일이동 전 이미지 객체 생성
    const result = this.imageRepository.save({
      ...dto
    })

    //파일 이동 (temp -> post folder)
    await fs.promises.rename(tempFilePath, newPath);

    return result;
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
