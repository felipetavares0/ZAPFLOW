import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common';
import { WabaService } from './waba.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('waba')
@UseGuards(JwtAuthGuard)
export class WabaController {
  constructor(private wabaService: WabaService) {}

  @Post('config')
  async createConfig(@Request() req, @Body() body: any) {
    return this.wabaService.createConfig(req.user.tenantId, body);
  }

  @Get('configs')
  async getConfigs(@Request() req) {
    return this.wabaService.getConfigsByTenant(req.user.tenantId);
  }

  @Post('send-test/:configId')
  async sendTest(@Param('configId') configId: string, @Body() body: any) {
    const { to, templateName, languageCode, components } = body;
    return this.wabaService.sendTemplateMessage(
      configId,
      to,
      templateName,
      languageCode || 'pt_BR',
      components || []
    );
  }

  @Get('templates/:configId')
  async getTemplates(@Param('configId') configId: string) {
    return this.wabaService.getTemplates(configId);
  }

  @Post('template/:configId')
  async createTemplate(@Param('configId') configId: string, @Body() body: any) {
    return this.wabaService.createTemplate(configId, body);
  }
}

