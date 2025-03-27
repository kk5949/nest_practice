import { ClassSerializerInterceptor, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './posts/entities/posts.entity';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { TimestampModule } from './timestamp/timestamp.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PUBLIC_PATH } from './common/const/path.const';
import * as process from 'process';
import { ImageModel } from './common/entities/image.entity';
import { ThrottleMiddleware } from './middlewares/throttle.middleware';

@Module({
  imports: [
    PostsModule,
    ConfigModule.forRoot(
      {
        isGlobal: true,
        envFilePath: '.env',
      }
    ),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env['DB_HOST'],
      port: parseInt(process.env['DB_PORT']),
      username: process.env['DB_USERNAME'],
      password: process.env['DB_PASSWORD'],
      database: process.env['DB_DATABASE'],
      entities: [PostsModel, User, ImageModel],
      synchronize: true,
      // logging: true,
    }),
    UserModule,
    AuthModule,
    TimestampModule,
    CommonModule,
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_PATH,
      serveRoot: '/public',
    })
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    }
  ],
})
export class AppModule implements NestModule{
  // ThrottleMiddleware 전역 적용
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ThrottleMiddleware).forRoutes('*');
  }
}
