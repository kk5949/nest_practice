import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';
import { POST_IMAGE_PATH, TEMP_PUBLIC_PATH } from './const/path.const';
import { v4 as uuid } from 'uuid';
import { AccessTokenGuard } from '../auth/guards/bearer-token.guard';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { ImageModel } from './entities/image.entity';

@Module({
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
  imports:[
    AuthModule,
    UserModule,
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
          cb(null, TEMP_PUBLIC_PATH);
        },
        filename: (req, file, cb) => {
          cb(null, uuid() + extname(file.originalname));
        },
      }),
    }),
    TypeOrmModule.forFeature([ImageModel])
  ]
})
export class CommonModule {}
