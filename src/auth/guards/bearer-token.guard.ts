/**
 * 구현할 기능
 *
 * 1. 요청객체 ( req )를 불러오고
 *  authorization header로부터 토큰을 가져온다
 * 2. authService.extractTokenFromHeader를 이용해서
 *  사용 할 수 있는 형태의 토큰을 추출한다
 * 3. authService.verifyToken 로 검증
 * 4. email과 password를 이용해서 사용자를 가져온다.
 *  authService.authenticateWithEmailAndPassword 사용.
 * 5. 찾아낸 사용자를 (1) 요청 객체에 붙여준다.
 *  req.user = user;
 */
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { AuthService } from '../auth.service';

@Injectable()
export class BearerTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authorization = req.headers['authorization'];

    if (!authorization) {
      throw new BadRequestException('토큰이 없습니다');
    }

    const token = this.authService.extractTokenFromHeader(authorization, true);

    const result = await this.authService.verifyToken(token);

    req.user = await this.userService.getUserByEmail(result.email);
    req.token = token;
    req.tokenType = result.type;
    return true;
  }
}

@Injectable()
export class AccessTokenGuard extends BearerTokenGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const req = context.switchToHttp().getRequest();

    if (req.tokenType !== 'access') {
      throw new BadRequestException('Access token이 아닙니다.');
    }
    return true;
  }
}
@Injectable()
export class RefreshTokenGuard extends BearerTokenGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const req = context.switchToHttp().getRequest();

    if (req.tokenType !== 'refresh') {
      throw new BadRequestException('Refresh token이 아닙니다.');
    }
    return true;
  }
}
