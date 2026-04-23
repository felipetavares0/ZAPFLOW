import { Controller, Get, Post, Body, Delete } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('status')
  getStatus() {
    return this.whatsappService.getStatus();
  }

  @Get('log')
  getLog() {
    return this.whatsappService.getMessageLog();
  }

  @Get('bot-config')
  getBotConfig() {
    return this.whatsappService.getBotConfig();
  }

  @Get('bot/sessions')
  getBotSessions() {
    return this.whatsappService.getBotSessions();
  }

  @Get('bot-templates')
  getBotTemplates() {
    return this.whatsappService.getBotTemplates();
  }

  @Post('bot-config')
  saveBotConfig(@Body() config: any) {
    return this.whatsappService.saveBotConfig(config);
  }

  @Post('send')
  async sendMessage(@Body() body: { number: string; message: string }) {
    return this.whatsappService.sendMessage(body.number, body.message);
  }

  @Post('broadcast')
  async broadcast(
    @Body() body: { contacts: { number: string; name?: string }[]; message: string; delayMs?: number; media?: { mimetype: string; data: string; filename: string } },
  ) {
    return this.whatsappService.sendBulk(body.contacts, body.message, body.delayMs || 3000, body.media);
  }

  @Post('stop')
  stopBroadcast() {
    this.whatsappService.stopBulk();
    return { success: true, message: 'Interrupção solicitada com sucesso.' };
  }

  @Delete('logout')
  async logout() {
    await this.whatsappService.logout();
    return { success: true, message: 'Sessão encerrada com sucesso.' };
  }
}
