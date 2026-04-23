import { WabaService } from './waba.service';
export declare class WabaController {
    private wabaService;
    constructor(wabaService: WabaService);
    createConfig(req: any, body: any): Promise<{
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
    getConfigs(req: any): Promise<{
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
    sendTest(configId: string, body: any): Promise<any>;
    getTemplates(configId: string): Promise<any>;
    createTemplate(configId: string, body: any): Promise<any>;
}
