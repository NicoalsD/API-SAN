import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto, RefreshDto, RegistroDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  registrar(@Body() datos: RegistroDto) {
    return this.authService.registrar(datos);
  }

  @Post('login')
  login(@Body() datos: LoginDto) {
    return this.authService.login(datos);
  }

  @Post('refresh')
  refresh(@Body() datos: RefreshDto) {
    return this.authService.refresh(datos.refreshToken);
  }
}