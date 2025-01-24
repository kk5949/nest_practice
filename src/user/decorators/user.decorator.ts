import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';

export const UserDecorator = createParamDecorator(
  (data: keyof User | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    // const user = req.user as User;
    const user: User = req.user;

    if (!user) {
      throw new InternalServerErrorException(
        'User Decorator Error : Request에 user 프로퍼티가 존재하지 않습니다.',
      );
    }

    if (data) {
      return user[data];
    }

    return user;
  },
);
