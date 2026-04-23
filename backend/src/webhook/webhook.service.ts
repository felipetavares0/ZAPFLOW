import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'arcomix_webhook_token_2024';
    
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('Webhook verificado pela Meta com sucesso!');
      return challenge;
    }
    
    return null;
  }

  processWebhookPayload(body: any) {
    this.logger.log(`Payload do webhook recebido: ${JSON.stringify(body)}`);

    if (body.object === 'whatsapp_business_account') {
      body.entry?.forEach((entry: any) => {
        const changes = entry.changes;
        
        changes?.forEach((change: any) => {
          if (change.value.messages) {
            this.handleIncomingMessage(change.value.messages[0], change.value.contacts[0]);
          } else if (change.value.statuses) {
            this.handleMessageStatus(change.value.statuses[0]);
          }
        });
      });
    }

    return { status: 'success' };
  }

  private handleIncomingMessage(message: any, contact: any) {
    this.logger.log(`Nova mensagem recebida de ${contact.wa_id} (${contact.profile.name}): ${message.text?.body}`);
    // Futuro: Encaminhar para o bot / atendimento humano / salvar no banco
  }

  private handleMessageStatus(status: any) {
    this.logger.log(`Status atualizado para mensagem ${status.id}: ${status.status} (Destinatário: ${status.recipient_id})`);
    // Futuro: Atualizar status do disparo no banco de dados (delivered, read, failed)
  }
}
