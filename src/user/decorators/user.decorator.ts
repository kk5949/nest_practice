import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const UserDecorator = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new InternalServerErrorException(
        'User Decorator Error : Request에 user 프로퍼티가 존재하지 않습니다.',
      );
    }

    return user;
  },
);
