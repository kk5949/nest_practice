import {
  Body,
  Controller,
  Delete,
  Get, InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards, UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { ParseBigintPipe } from '../pipes/parse-bigint-pipe';
import { AccessTokenGuard } from '../auth/guards/bearer-token.guard';
import { UserDecorator } from '../user/decorators/user.decorator';
import { CreatePostDto } from './dto/create-post';
import { UpdatePostDto } from './dto/update-post';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { ImageType } from '../common/entities/image.entity';
import { PostsModel } from './entities/posts.entity';
import { CreatePostImageDto } from './images/create-image.dto';
import { QueryRunner } from 'typeorm';
import { PostsImagesService } from './images.service';
import { TransactionInterceptor } from '../interceptors/transaction.interceptor';
import { QueryRunnerDecorator } from '../common/decorators/query-runner.decorator';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsImagesService: PostsImagesService,
  ) {
  }

  @Get()
  /**
   * serialization -> 직렬화 -> Nestjs 에서 사용하는 데이터 구조를 다른시스템에서도 쉽게 사용 가능하도록 포맷 변환
   * deserialization -> 역직렬화
   */
  getPosts(
    @Query() body: PaginatePostDto,
  ) {
    return this.postsService.paginatePosts(body);
  }

  @Get(':id')
  getPost(@Param('id', ParseBigintPipe) id: string) {
    return this.postsService.getPostById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  async postPosts(
    @UserDecorator('id') user: number,
    @QueryRunnerDecorator() qr: QueryRunner,
    @Body() body: CreatePostDto,
  ) {
    const post: PostsModel = await this.postsService.createPost(user, body, qr);

    // 이미지 갯수에 따라 반복문 처리, 인덱스를 order로사용
    for (let i = 0; i < body.images.length; i++) {
      // 이미지 업로드
      const imageDto = {
        post: post,
        order: i + 1,
        path: body.images[i],
        type: <ImageType>ImageType.POST_IMAGE,
      } as CreatePostImageDto;

      //request 객체에 담긴 queryRunner를 사용하여 트랜잭션 처리
      await this.postsImagesService.createPostImage(imageDto, qr);
    }
    return this.postsService.getPostById(post.id, qr);
  }

  @Patch(':id')
  patchPost(
    @Param('id', ParseBigintPipe) id: string,
    @Body() body: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, body);
  }

  @Delete(':id')
  async deletePost(@Param('id', ParseBigintPipe) id: string) {
    await this.postsService.deletePost(id);
  }
}