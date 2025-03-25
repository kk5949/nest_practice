import { BadRequestException, Injectable} from '@nestjs/common';
import { Repository, QueryRunner } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageModel } from '../common/entities/image.entity';
import { CreatePostImageDto } from './images/create-image.dto';
import { basename, join } from 'path';
import { POST_IMAGE_PATH, TEMP_PUBLIC_PATH } from '../common/const/path.const';
import * as fs from 'fs';

@Injectable()
export class PostsImagesService {
  constructor(
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
  ) {
  }

  getImageRepository(queryRunner?: QueryRunner) {
      return queryRunner?queryRunner.manager.getRepository(ImageModel):this.imageRepository;
  }

  async createPostImage(dto: CreatePostImageDto, queryRunner?: QueryRunner) {
    //dto 이미지를 기반으로 파일 경로 생성
    //반복문으로 image 처리
    const tempFilePath = join(TEMP_PUBLIC_PATH, dto.path);
    // 트랜잭션 처리
    try {
      await fs.promises.access(tempFilePath);
    } catch (e) {
      console.log(e);
      throw new BadRequestException('파일이 존재하지 않습니다.');
    }

    const fileName = basename(tempFilePath);

    const newPath = join(POST_IMAGE_PATH, fileName);
    const imageRepository = this.getImageRepository(queryRunner);
    //파일이동 전 이미지 객체 생성
    const result = imageRepository.save({
      ...dto
    })

    //파일 이동 (temp -> post folder)
    await fs.promises.rename(tempFilePath, newPath);

    return result;
  }
}