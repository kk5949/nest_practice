import { FindManyOptions, FindOneOptions, FindOptionsRelations } from 'typeorm';
import { PostsModel } from '../entities/posts.entity';

export const DEFAULT_POST_FIND_OPTIONS: FindOneOptions<PostsModel>|FindManyOptions<PostsModel> = {
  relations:{
    user: true,
    images: true,
  } as FindOptionsRelations<PostsModel>
};