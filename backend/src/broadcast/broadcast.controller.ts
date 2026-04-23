import { Controller, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('broadcast')
@UseGuards(JwtAuthGuard)
export class BroadcastController {
  constructor(private broadcastService: BroadcastService) {}

  @Post('trigger')
  async triggerMessage(@Body() body: any) {
    try {
      const job = await this.broadcastService.queueMessage(body);
      return { success: true, jobId: job.id };
    } catch (error) {
      throw new HttpException(
        { message: 'Falha ao enfileirar mensagem', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('trigger-bulk')
  async triggerBulk(@Body() body: { messages: any[] }) {
    try {
      const jobs = await this.broadcastService.queueBulkMessages(body.messages);
      return { success: true, count: jobs.length };
    } catch (error) {
      throw new HttpException(
        { message: 'Falha ao enfileirar mensagens em massa', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
