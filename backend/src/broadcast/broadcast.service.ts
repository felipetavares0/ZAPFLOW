import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BroadcastService {
  constructor(@InjectQueue('broadcast') private broadcastQueue: Queue) {}

  async queueMessage(data: {
    configId: string;
    to: string;
    templateName: string;
    languageCode: string;
    components: any[];
  }) {
    // Adiciona o job à fila com retentativas configuradas (3 vezes com delay exponencial)
    return this.broadcastQueue.add('send-message', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  async queueBulkMessages(messages: any[]) {
    const jobs = messages.map((msg) => ({
      name: 'send-message',
      data: msg,
      opts: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }));
    return this.broadcastQueue.addBulk(jobs);
  }
}
