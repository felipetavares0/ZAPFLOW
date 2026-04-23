import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            tenantId: any;
            role: any;
        };
    }>;
    register(body: {
        name: string;
        email: string;
        password: string;
        companyName: string;
    }): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            tenantId: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    getProfile(req: any): any;
}
