"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const common_1 = require("@nestjs/common");
let WebhookService = WebhookService_1 = class WebhookService {
    logger = new common_1.Logger(WebhookService_1.name);
    verifyWebhook(mode, token, challenge) {
        const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'arcomix_webhook_token_2024';
        if (mode === 'subscribe' && token === verifyToken) {
            this.logger.log('Webhook verificado pela Meta com sucesso!');
            return challenge;
        }
        return null;
    }
    processWebhookPayload(body) {
        this.logger.log(`Payload do webhook recebido: ${JSON.stringify(body)}`);
        if (body.object === 'whatsapp_business_account') {
            body.entry?.forEach((entry) => {
                const changes = entry.changes;
                changes?.forEach((change) => {
                    if (change.value.messages) {
                        this.handleIncomingMessage(change.value.messages[0], change.value.contacts[0]);
                    }
                    else if (change.value.statuses) {
                        this.handleMessageStatus(change.value.statuses[0]);
                    }
                });
            });
        }
        return { status: 'success' };
    }
    handleIncomingMessage(message, contact) {
        this.logger.log(`Nova mensagem recebida de ${contact.wa_id} (${contact.profile.name}): ${message.text?.body}`);
    }
    handleMessageStatus(status) {
        this.logger.log(`Status atualizado para mensagem ${status.id}: ${status.status} (Destinatário: ${status.recipient_id})`);
    }
};
exports.WebhookService = WebhookService;
exports.WebhookService = WebhookService = WebhookService_1 = __decorate([
    (0, common_1.Injectable)()
], WebhookService);
//# sourceMappingURL=webhook.service.js.map