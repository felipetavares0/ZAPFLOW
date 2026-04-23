import { WebhookService } from './webhook.service';
import type { Response } from 'express';
export declare class WebhookController {
    private readonly webhookService;
    constructor(webhookService: WebhookService);
    verifyWebhook(mode: string, token: string, challenge: string, res: Response): void;
    processWebhook(body: any, res: Response): void;
}
