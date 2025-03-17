import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query, UploadedFile,
  UseGuards, UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { ParseBigintPipe } from '../pipes/parse-bigint-pipe';
import { AccessTokenGuard } from '../auth/guards/bearer-token.guard';
import { UserDecorator } from '../user/decorators/user.decorator';
import { CreatePostDto } from './dto/create-post';
import { UpdatePostDto } from './dto/update-post';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  /**
   * serialization -> 직렬화 -> Nestjs 에서 사용하는 데이터 구조를 다른시스템에서도 쉽게 사용 가능하도록 포맷 변환
   * deserialization -> 역직렬화
   */
  getPosts(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Query() body: PaginatePostDto,
  ) {
    // return this.postsService.getAllPosts();
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
    await this.postsService.createPostImage(body);

    return this.postsService.createPost(user, body);
  }

  @Patch(':id')
  patchPost(
    @Param('id', ParseBigintPipe) id: string,
    @Body() body: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, body);
  }

  @Delete(':id')
  deletePost(@Param('id', ParseBigintPipe) id: string) {
    this.postsService.deletePost(id);
  }
}
