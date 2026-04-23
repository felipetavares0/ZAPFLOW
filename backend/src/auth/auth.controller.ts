import { Controller, Post, Body, UnauthorizedException, ConflictException, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: { name: string; email: string; password: string; companyName: string }) {
    const { name, email, password, companyName } = body;
    try {
      return await this.authService.register(name, email, password, companyName);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Este e-mail já está cadastrado.');
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}

