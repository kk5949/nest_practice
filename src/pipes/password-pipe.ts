import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';

@Injectable()
export class PasswordPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    // 패스워드 길이 체크
    if (value.length > 20 || value.length < 8) {
      throw new BadRequestException(
        '패스워드의 길이는 8이상 20자 미만으로 입력해야합니다.',
      );
    }

    return value;
  }
}