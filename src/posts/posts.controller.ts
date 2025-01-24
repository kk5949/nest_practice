import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put, Request, UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { ParseBigintPipe } from '../pipes/parse-bigint-pipe';
import { AccessTokenGuard } from '../auth/guards/bearer-token.guard';
import { UserDecorator } from '../user/decorators/user.decorator';
import { User } from '../user/entities/user.entity';
import { CreatePostDto } from './dto/create-post';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts() {
    return this.postsService.getAllPosts();
  }

  @Get(':id')
  getPost(@Param('id', ParseBigintPipe) id: string) {
    return this.postsService.getPostById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  postPosts(
    @UserDecorator('id') user: number,
    @Body() body: CreatePostDto,
  ) {
    return this.postsService.createPost(user, body);
  }

  @Put(':id')
  putPost(
    @Param('id', ParseBigintPipe) id: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(id, title, content);
  }

  @Delete(':id')
  deletePost(@Param('id', ParseBigintPipe) id: string) {
    this.postsService.deletePost(id);
  }
}
