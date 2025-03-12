import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsModel } from './entities/posts.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { CommonService } from '../common/common.service';
import { MulterModule } from '@nestjs/platform-express';
import { CommonModule } from '../common/common.module';
import * as multer from 'multer';
import { extname } from 'path';
import { POST_IMAGE_PATH } from '../common/const/path.const';
import { v4 as uuid } from 'uuid';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel]),
    AuthModule,
    UserModule,
    CommonModule,
    MulterModule.register({
      limits: {
        // 이미지 10MB 제한
        // 이미지 확장자만 허용 ( jpg, jpeg, png, gif, webp )
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        if (
          ext === '.jpeg' ||
          ext === '.png' ||
          ext === '.gif' ||
          ext === '.webp'
        ) {
          cb(null, true);
        } else {
          cb(new Error('jpg, jpeg, png, gif, webp 이미지 확장자만 허용합니다.'), false);
        }
      },
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, POST_IMAGE_PATH);
        },
        filename: (req, file, cb) => {
          cb(null, uuid() + extname(file.originalname));
        },
      }),
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService, CommonService],
})
export class PostsModule {
}
