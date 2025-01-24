import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  JsonWebTokenError,
  JwtService,
  TokenExpiredError,
} from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { HASH_ROUNDS, JWT_SECRET } from './const/auth.const';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  /**
   * 1) registerWithEmail
   * - email, nickname, password 를 입력받고 사용자를 생성한다
   * - accessToken refreshToken 을 반환한다.
   *
   * 2) loginWithEmail
   * - email, password를 입력하면 사용자 검증
   * - accessToken refreshToken 반환
   *
   *
   * 3) loginUser
   *
   * 4)signToken
   *
   * 5)authenticateWithEmailAndPassword
   * 로그인 진행시 기본적인 검증 진행
   * 사용자가 존재하는지 email로 확인
   * 비밀번호 확인
   * 모두 통과시 사용자 정보 반환
   * loginWithEmail 에서 반환된 데이터를 기반으로 토큰 생성
   */

  async loginWithEmail(user: Pick<User, 'email' | 'password'>) {
    const existUser = await this.authenticateWithEmailAndPassword(user);
    return this.loginUser(existUser);
  }

  async registerWithEmail(user: Pick<User, 'email' | 'nickname' | 'password'>) {
    const hash = await bcrypt.hash(user.password, HASH_ROUNDS);

    const newFace = await this.userService.createUser({
      ...user,
      password: hash,
    });

    return this.loginUser(newFace);
  }

  /**
   * user의 email, id를 전달
   * type을 받아서 refresh, access 구분
   * */
  signToken(user: Pick<User, 'email' | 'id'>, isRefresh: boolean = false) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefresh ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: isRefresh ? '1h' : '30m',
    });
  }

  loginUser(user: Pick<User, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateWithEmailAndPassword(
    user: Pick<User, 'email' | 'password'>,
  ) {
    const existUser = await this.userService.getUserByEmail(user.email);

    if (!existUser) {
      throw new UnauthorizedException('user not found');
    }

    // 비밀번호 검증
    const pass = await bcrypt.compare(user.password, existUser.password);
    if (!pass) {
      throw new UnauthorizedException('wrong password');
    }

    return existUser;
  }

  /**
   * @param header
   * @param isBearer
   * @description
   * request Header로 부터 token를 추출
   */
  extractTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(' ');
    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (splitToken.length !== 2 || prefix !== splitToken[0]) {
      throw new UnauthorizedException('invalid token format');
    }
    return splitToken[1];
  }

  /**
   * @param token
   * @description
   * base64 로 된 email:password 를 decode 후 분리하여 리턴
   */
  decodeBasicToken(token: string) {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [email, password] = decoded.split(':');
    return { email, password };
  }

  /**
   * @param token
   * @description 토큰검증
   */
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: JWT_SECRET,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token has expired.');
      } else if (error instanceof JsonWebTokenError) {
        throw new BadRequestException('Invalid token.');
      } else {
        throw new HttpException(
          'An unknown error occurred during token verification.',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  /**
   * @param token
   * @param isRefresh
   */
  rotateToken(token: string, isRefresh: boolean) {
    const decoded = this.jwtService.verify(token, {
      secret: JWT_SECRET,
    });

    if (decoded.type !== 'refresh') {
      throw new BadRequestException('토큰 재발급은 refresh token 으로만 가능.');
    }

    return this.signToken(
      {
        ...decoded,
      },
      isRefresh,
    );
  }
}
