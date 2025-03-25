import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
} from '@nestjs/common';
import { catchError, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DataSource } from 'typeorm';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(
    private readonly dataSource: DataSource,
  ) {
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    // TypeORM의 QueryRunner를 사용하여 트랜잭션 처리
    // 에러 발생시 롤백+릴리즈 후 에러메시지 전달
    // 성공시 커밋+릴리즈
    const req = context.switchToHttp().getRequest();
    const queryRunner = await this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    req.queryRunner = queryRunner;

    return next
      .handle()
      .pipe(
        catchError(async (e) => {
          await queryRunner.rollbackTransaction();
          await queryRunner.release();
          throw new InternalServerErrorException(e.message);
        })
        , tap(async () => {
          await queryRunner.commitTransaction();
          await queryRunner.release();
        }),
      );
  }
}
