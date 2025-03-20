import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
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

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

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
  async postPosts(
    @UserDecorator('id') user: number,
    @Body() body: CreatePostDto,
  ) {
    const post:PostsModel =  await this.postsService.createPost(user, body);

    // 이미지 갯수에 따라 반복문 처리, 인덱스를 order로사용
    for (let i = 0; i < body.images.length; i++) {
      // 이미지 업로드
      const imageDto = {
        post:post,
        order: i+1,
        path: body.images[i],
        type: <ImageType>ImageType.POST_IMAGE,
      } as CreatePostImageDto
      await this.postsService.createPostImage(imageDto)
    }
    return this.postsService.getPostById(post.id);
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