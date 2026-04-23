import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class WabaService {
  private readonly metaBaseUrl = 'https://graph.facebook.com/v19.0';

  constructor(private prisma: PrismaService) {}

  async createConfig(tenantId: string, data: any) {
    return this.prisma.wabaConfig.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async getConfigsByTenant(tenantId: string) {
    return this.prisma.wabaConfig.findMany({
      where: { tenantId },
    });
  }

  async sendTemplateMessage(configId: string, to: string, templateName: string, languageCode: string, components: any[]) {
    const config = await this.prisma.wabaConfig.findUnique({
      where: { id: configId },
    });

    if (!config) {
      throw new HttpException('Configuração WABA não encontrada', HttpStatus.NOT_FOUND);
    }

    try {
      const response = await axios.post(
        `${this.metaBaseUrl}/${config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || error.message;
      throw new HttpException(
        { message: 'Falha ao enviar mensagem via Meta API', error: errorData },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getTemplates(configId: string) {
    const config = await this.prisma.wabaConfig.findUnique({
      where: { id: configId },
    });

    if (!config) {
      throw new HttpException('Configuração WABA não encontrada', HttpStatus.NOT_FOUND);
    }

    try {
      const response = await axios.get(
        `${this.metaBaseUrl}/${config.wabaId}/message_templates`,
        {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || error.message;
      throw new HttpException(
        { message: 'Falha ao buscar templates da Meta API', error: errorData },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createTemplate(configId: string, templateData: any) {
    const config = await this.prisma.wabaConfig.findUnique({
      where: { id: configId },
    });

    if (!config) {
      throw new HttpException('Configuração WABA não encontrada', HttpStatus.NOT_FOUND);
    }

    try {
      const response = await axios.post(
        `${this.metaBaseUrl}/${config.wabaId}/message_templates`,
        templateData,
        {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || error.message;
      throw new HttpException(
        { message: 'Falha ao criar template na Meta API', error: errorData },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

