export declare class WebhookService {
    private readonly logger;
    verifyWebhook(mode: string, token: string, challenge: string): string | null;
    processWebhookPayload(body: any): {
        status: string;
    };
    private handleIncomingMessage;
    private handleMessageStatus;
}
