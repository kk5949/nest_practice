import { PostsModel } from '../entities/posts.entity';
import { PickType } from '@nestjs/mapped-types';

//Pick, Omit, Partial -> type 반환
//PickType, OmitType, PartialType -> class 반환
export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {

}