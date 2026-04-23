import { WhatsappService } from './whatsapp.service';
export declare class WhatsappController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsappService);
    getStatus(): {
        status: import("./whatsapp.service").WhatsappStatus;
        qrCode: string | null;
        totalSent: number;
        totalFailed: number;
    };
    getLog(): {
        number: string;
        message: string;
        status: string;
        time: Date;
    }[];
    getBotConfig(): any;
    getBotSessions(): any[];
    getBotTemplates(): any;
    saveBotConfig(config: any): {
        success: boolean;
    };
    sendMessage(body: {
        number: string;
        message: string;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
    broadcast(body: {
        contacts: {
            number: string;
            name?: string;
        }[];
        message: string;
        delayMs?: number;
        media?: {
            mimetype: string;
            data: string;
            filename: string;
        };
    }): Promise<{
        sent: number;
        failed: number;
        errors: string[];
    }>;
    stopBroadcast(): {
        success: boolean;
        message: string;
    };
    logout(): Promise<{
        success: boolean;
        message: string;
    }>;
}
