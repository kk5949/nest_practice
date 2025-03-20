import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsModel } from './entities/posts.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { CommonService } from '../common/common.service';
import { CommonModule } from '../common/common.module';
import { ImageModel } from '../common/entities/image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostsModel,
      ImageModel,
    ]),
    AuthModule,
    UserModule,
    CommonModule,
    ImageModel,
  ],
  controllers: [PostsController],
  providers: [PostsService, CommonService],
})
export class PostsModule {
}
