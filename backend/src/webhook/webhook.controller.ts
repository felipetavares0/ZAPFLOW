import { Controller, Get, Post, Query, Body, Res, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import type { Response } from 'express';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response
  ) {
    const responseChallenge = this.webhookService.verifyWebhook(mode, token, challenge);
    
    if (responseChallenge) {
      res.status(HttpStatus.OK).send(responseChallenge);
    } else {
      res.status(HttpStatus.FORBIDDEN).send('Verificação do Webhook falhou.');
    }
  }

  @Post()
  processWebhook(@Body() body: any, @Res() res: Response) {
    this.webhookService.processWebhookPayload(body);
    res.status(HttpStatus.OK).send('EVENT_RECEIVED');
  }
}
