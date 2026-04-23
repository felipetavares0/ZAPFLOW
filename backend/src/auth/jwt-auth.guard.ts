import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Simula um usuário admin autenticado para permitir acesso direto sem login
    request.user = {
      userId: 'admin-fixed-id',
      email: 'admin@zapflow.com',
      tenantId: 'd65e8a60-9d33-4f1b-a08e-f14d9b33a7f8', // Um ID de tenant fixo
      role: 'ADMIN'
    };
    
    return true; 
  }
}
