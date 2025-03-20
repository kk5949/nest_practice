import { TimestampModel } from '../../timestamp/entities/timestamp.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { join } from 'path';
import { POST_PUBLIC_PATH } from '../const/path.const';
import { PostsModel } from '../../posts/entities/posts.entity';

export enum ImageType {
  POST_IMAGE='POST',
}

@Entity()
export class ImageModel extends TimestampModel {
  @Column()
  @IsNumber()
  @IsOptional()
  order?: number;

  @Column({ enum: ImageType })
  @IsEnum(ImageType)
  type: ImageType;

  @Column()
  @IsString()
  @Transform(function(params):string{
    const { value,obj } = params;
    if(obj.type === ImageType.POST_IMAGE){
      return `/${join(POST_PUBLIC_PATH, value)}`;
    }else{
      return value;
    }
  })
  path: string;

  @ManyToOne(() => PostsModel, (post) => post.images)
  post?: PostsModel;
}