import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PasswordPipe } from '../pipes/password-pipe';
import { BasicTokenGuard } from './guards/basic-token.guard';
import { RefreshTokenGuard } from './guards/bearer-token.guard';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token/access')
  @UseGuards(RefreshTokenGuard)
  postTokenAccess(@Headers('authorization') authorization: string) {
    const token = this.authService.extractTokenFromHeader(authorization, true);
    const newToken = this.authService.rotateToken(token, false);

    return {
      accessToken: newToken,
    };
  }

  @Post('token/refresh')
  @UseGuards(RefreshTokenGuard)
  postTokenRefresh(@Headers('authorization') authorization: string) {
    const token = this.authService.extractTokenFromHeader(authorization, true);
    const newToken = this.authService.rotateToken(token, true);

    return {
      refreshToken: newToken,
    };
  }

  @Post('login/email')
  @UseGuards(BasicTokenGuard)
  postLoginEmail(
    @Headers('authorization') authorization: string,
  ) {
    const token = this.authService.extractTokenFromHeader(authorization, false);
    return this.authService.loginWithEmail(
      this.authService.decodeBasicToken(token),
    );
  }

  @Post('register/email')
  PostRegisterEmail(
    @Body() body: RegisterUserDto
  ) {
    return this.authService.registerWithEmail(body);
  }
}
