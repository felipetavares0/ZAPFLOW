import { PrismaService } from '../prisma/prisma.service';
export declare class WabaService {
    private prisma;
    private readonly metaBaseUrl;
    constructor(prisma: PrismaService);
    createConfig(tenantId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        phoneNumberId: string;
        wabaId: string;
        accessToken: string;
        phoneNumber: string;
        verified: boolean;
    }>;
    getConfigsByTenant(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        phoneNumberId: string;
        wabaId: string;
        accessToken: string;
        phoneNumber: string;
        verified: boolean;
    }[]>;
    sendTemplateMessage(configId: string, to: string, templateName: string, languageCode: string, components: any[]): Promise<any>;
    getTemplates(configId: string): Promise<any>;
    createTemplate(configId: string, templateData: any): Promise<any>;
}
