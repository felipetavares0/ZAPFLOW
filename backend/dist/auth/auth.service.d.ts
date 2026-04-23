import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private prisma;
    constructor(usersService: UsersService, jwtService: JwtService, prisma: PrismaService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            tenantId: any;
            role: any;
        };
    }>;
    register(name: string, email: string, password: string, companyName: string): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            tenantId: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
}
