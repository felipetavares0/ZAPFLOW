import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { WabaModule } from './waba/waba.module';
import { BroadcastModule } from './broadcast/broadcast.module';
import { BullModule } from '@nestjs/bullmq';
import { WebhookModule } from './webhook/webhook.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { LeadsModule } from './leads/leads.module';

@Module({
  imports: [
    TenantsModule, 
    UsersModule, 
    AuthModule, 
    PrismaModule, 
    WabaModule, 
    BroadcastModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    WebhookModule,
    WhatsappModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
