import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsModel } from './entities/posts.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostsModel]), AuthModule, UserModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
