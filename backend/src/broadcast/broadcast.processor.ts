import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { WabaService } from '../waba/waba.service';
import { Logger } from '@nestjs/common';

@Processor('broadcast')
export class BroadcastProcessor extends WorkerHost {
  private readonly logger = new Logger(BroadcastProcessor.name);

  constructor(private wabaService: WabaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { configId, to, templateName, languageCode, components } = job.data;

    this.logger.log(`Processando envio para ${to} usando template ${templateName}`);

    try {
      const result = await this.wabaService.sendTemplateMessage(
        configId,
        to,
        templateName,
        languageCode,
        components,
      );
      this.logger.log(`Mensagem enviada com sucesso para ${to}. ID: ${result.messages[0]?.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Falha ao enviar mensagem para ${to}: ${error.message}`);
      throw error; // BullMQ lidará com o retry se configurado
    }
  }
}
