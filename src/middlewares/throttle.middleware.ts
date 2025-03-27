import { NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

export class ThrottleMiddleware implements NestMiddleware {
  private limiter: ReturnType<typeof rateLimit>;

  constructor() {
    this.limiter = rateLimit({
      windowMs: 10 * 60 * 1000, // 10분
      max: 60, // IP당 10분 60회 제한
      message: {
        statusCode: 429,
        error: 'Too Many Requests',
        message: '요청 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.'
      },
      standardHeaders: true, // `RateLimit-*` 헤더 반환
      legacyHeaders: false, // `X-RateLimit-*` 헤더 비활성화

      // 특정 IP 화이트리스트 설정 (옵션)
      skip: (req) => {
        const whitelistIPs = ['127.0.0.1', '::1']; // localhost IP
        return whitelistIPs.includes(req.ip);
      }
    });
  }

  use(req, res, next: NextFunction) {
    this.limiter(req, res, next);
  }
}