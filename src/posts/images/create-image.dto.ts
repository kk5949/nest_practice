import { ImageModel } from '../../common/entities/image.entity';
import { PickType } from '@nestjs/mapped-types';

export class CreatePostImageDto extends PickType(ImageModel, [
  'post',
  'path',
  'order',
  'type',
]){

}