import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseBigintPipe implements PipeTransform<string, bigint> {
  transform(value: string): bigint {
    // 값이 숫자 형태의 문자열인지 확인
    if (!/^-?\d+$/.test(value)) {
      throw new BadRequestException(
        `Validation failed (bigint string is expected): received "${value}"`,
      );
    }

    try {
      // `bigint`로 변환
      return BigInt(value);
    } catch (error) {
      throw new BadRequestException(
        `Validation failed (bigint string is expected): ${error.message}`,
      );
    }
  }
}
