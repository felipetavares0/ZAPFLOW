import { OnModuleInit } from '@nestjs/common';
export type WhatsappStatus = 'INITIALIZING' | 'WAITING_QR' | 'CONNECTED' | 'DISCONNECTED' | 'AUTH_FAILURE';
export declare class WhatsappService implements OnModuleInit {
    private readonly logger;
    private client;
    private status;
    private qrCodeBase64;
    private messageLog;
    private totalSent;
    private totalFailed;
    private stopRequested;
    private readonly CONFIG_PATH;
    private userSessions;
    onModuleInit(): void;
    private initClient;
    getStatus(): {
        status: WhatsappStatus;
        qrCode: string | null;
        totalSent: number;
        totalFailed: number;
    };
    getMessageLog(): {
        number: string;
        message: string;
        status: string;
        time: Date;
    }[];
    sendMessage(number: string, message: string, media?: {
        mimetype: string;
        data: string;
        filename: string;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
    sendBulk(contacts: {
        number: string;
        name?: string;
    }[], message: string, delayMs?: number, media?: {
        mimetype: string;
        data: string;
        filename: string;
    }): Promise<{
        sent: number;
        failed: number;
        errors: string[];
    }>;
    logout(): Promise<void>;
    stopBulk(): void;
    getBotConfig(): any;
    saveBotConfig(config: any): {
        success: boolean;
    };
    getBotTemplates(): any;
    getBotSessions(): any[];
    private handleIncomingMessage;
    private processHumanTimeouts;
}
