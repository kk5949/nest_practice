import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const QueryRunnerDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if(!request.queryRunner) {
      throw new Error('QueryRunner is not found in request object');
    }

    return request.queryRunner;
  },
);