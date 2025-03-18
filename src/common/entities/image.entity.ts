import { TimestampModel } from '../../timestamp/entities/timestamp.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { join } from 'path';
import { POST_IMAGE_PATH } from '../const/path.const';
import { PostsModel } from '../../posts/entities/posts.entity';

export enum ImageType {
  POST_IMAGE='POST',
}

@Entity()
export class ImageModel extends TimestampModel {
  @Column()
  @IsInt()
  @IsOptional()
  order?: number;

  @Column({ enum: ImageType })
  @IsEnum(ImageType)
  @IsString()
  type: string;

  @Column()
  @IsString()
  @Transform(function(params):string{
    const { value,obj } = params;
    if(obj.type === ImageType.POST_IMAGE){
      return join(POST_IMAGE_PATH, value);
    }else{
      return value;
    }
  })
  path: string;

  @ManyToOne(() => PostsModel, (post) => post.images)
  post?: PostsModel;
}