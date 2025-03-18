import { PostsModel } from '../entities/posts.entity';
import { PickType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';

//Pick, Omit, Partial -> type 반환
//PickType, OmitType, PartialType -> class 반환
export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {
  @IsString({
    each: true,
  })
  @IsOptional()
  images?: string[] = [];
}