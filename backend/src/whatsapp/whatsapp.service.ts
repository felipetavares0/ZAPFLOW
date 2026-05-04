import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// Trigger for rebuild - Bot Config hierarchical update
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

export type WhatsappStatus = 'INITIALIZING' | 'WAITING_QR' | 'CONNECTED' | 'DISCONNECTED' | 'AUTH_FAILURE';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private readonly logger = new Logger(WhatsappService.name);
  private client: Client;
  private status: WhatsappStatus = 'INITIALIZING';
  private qrCodeBase64: string | null = null;
  private messageLog: { number: string; message: string; status: string; time: Date }[] = [];
  private totalSent = 0;
  private totalFailed = 0;
  private stopRequested = false;

  private readonly CONFIG_PATH = path.join(__dirname, 'config', 'bot-config.json');
  private userSessions = new Map<string, any>();

  onModuleInit() {
    this.initClient();
  }

  private initClient() {
    this.status = 'INITIALIZING';
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'arcomix-session',
        dataPath: './.wpp-sessions',
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          ...(process.platform === 'win32' ? ['--single-process'] : []),
          '--disable-gpu',
          '--proxy-server="direct://"',
          '--proxy-bypass-list=*',
          '--ignore-certificate-errors'
        ],
      },
    });

    this.client.on('qr', async (qr) => {
      this.logger.log('QR Code gerado. Escaneie para conectar.');
      this.status = 'WAITING_QR';
      this.qrCodeBase64 = await QRCode.toDataURL(qr);
    });

    this.client.on('ready', () => {
      this.logger.log('WhatsApp conectado com sucesso!');
      this.status = 'CONNECTED';
      this.qrCodeBase64 = null;
    });

    this.client.on('authenticated', () => {
      this.logger.log('Sessão autenticada. Dados salvos localmente.');
    });

    this.client.on('auth_failure', () => {
      this.logger.error('Falha de autenticação.');
      this.status = 'AUTH_FAILURE';
    });

    this.client.on('disconnected', (reason) => {
      this.logger.warn(`WhatsApp desconectado: ${reason}`);
      this.status = 'DISCONNECTED';
    });

    this.client.on('message', async (msg) => {
      try {
        await this.handleIncomingMessage(msg);
      } catch (err) {
        this.logger.error(`Erro ao processar mensagem do bot: ${err.message}`);
      }
    });

    this.client.initialize().catch((err) => {
      this.logger.error(`Erro ao inicializar cliente: ${err.message}`);
      this.status = 'DISCONNECTED';
    });

    // Monitoramento de Timeouts de Atendimento Humano
    setInterval(() => this.processHumanTimeouts(), 60000); // Checa a cada minuto
  }

  getStatus(): { status: WhatsappStatus; qrCode: string | null; totalSent: number; totalFailed: number } {
    return {
      status: this.status,
      qrCode: this.qrCodeBase64,
      totalSent: this.totalSent,
      totalFailed: this.totalFailed,
    };
  }

  getMessageLog() {
    return this.messageLog.slice(-50); // últimas 50 mensagens
  }

  async sendMessage(
    number: string, 
    message: string, 
    media?: { mimetype: string; data: string; filename: string }
  ): Promise<{ success: boolean; error?: string }> {
    if (this.status !== 'CONNECTED') {
      return { success: false, error: 'WhatsApp não está conectado.' };
    }
    try {
      let rawNumber = number.replace(/\D/g, '');
      if (rawNumber && !rawNumber.startsWith('55')) {
        rawNumber = '55' + rawNumber;
      }
      
      const numberId = await this.client.getNumberId(rawNumber);
      if (!numberId) {
        throw new Error(`O número ${number} não possui um WhatsApp válido.`);
      }
      const chatId = numberId._serialized;
      
      if (media) {
        const wppMedia = new MessageMedia(media.mimetype, media.data, media.filename);
        await this.client.sendMessage(chatId, wppMedia, { caption: message });
      } else {
        await this.client.sendMessage(chatId, message);
      }
      this.totalSent++;
      this.messageLog.push({ number, message, status: 'sent', time: new Date() });
      return { success: true };
    } catch (error) {
      this.totalFailed++;
      this.messageLog.push({ number, message, status: 'failed', time: new Date() });
      return { success: false, error: error.message };
    }
  }

  async sendBulk(
    contacts: { number: string; name?: string }[],
    message: string,
    delayMs = 3000,
    media?: { mimetype: string; data: string; filename: string }
  ): Promise<{ sent: number; failed: number; errors: string[] }> {
    if (this.status !== 'CONNECTED') {
      return { sent: 0, failed: contacts.length, errors: ['WhatsApp não está conectado.'] };
    }

    this.stopRequested = false;
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const contact of contacts) {
      if (this.stopRequested) break;
      const personalizedMsg = message.replace(/\{\{nome\}\}/gi, contact.name || 'Cliente');

      const result = await this.sendMessage(contact.number, personalizedMsg, media);
      if (result.success) {
        sent++;
      } else {
        failed++;
        errors.push(`${contact.number}: ${result.error}`);
      }

      if (contacts.indexOf(contact) < contacts.length - 1) {
        await new Promise((r) => setTimeout(r, delayMs + Math.random() * 2000));
      }
    }

    return { sent, failed, errors };
  }

  async logout(): Promise<void> {
    try {
      await this.client.logout();
      this.status = 'DISCONNECTED';
      this.stopRequested = false;
      this.qrCodeBase64 = null;
      this.logger.log('Sessão encerrada.');
      // Re-inicia para gerar novo QR se necessário
      setTimeout(() => this.initClient(), 2000);
    } catch (error) {
      this.logger.error(`Erro ao deslogar: ${error.message}`);
    }
  }

  stopBulk() {
    this.stopRequested = true;
  }

  getBotConfig() {
    try {
      const config = JSON.parse(fs.readFileSync(this.CONFIG_PATH, 'utf8'));
      return config;
    } catch {
      return { enabled: false, welcomeMessage: '', brands: [] };
    }
  }

  saveBotConfig(config: any) {
    fs.writeFileSync(this.CONFIG_PATH, JSON.stringify(config, null, 2));
    return { success: true };
  }

  getBotTemplates() {
    try {
      const templates = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'bot-templates.json'), 'utf8'));
      return templates;
    } catch {
      return [];
    }
  }

  getBotSessions() {
    const sessions: any[] = [];
    this.userSessions.forEach((val, key) => {
      sessions.push({
        number: key.split('@')[0],
        state: val.state,
        clientName: val.clientName,
        lastInteraction: val.timestamp,
        selectedStore: val.selectedStore,
        selectedBrandName: val.selectedBrandName
      });
    });
    return sessions;
  }

  private async handleIncomingMessage(msg: any) {
    if (msg.from === 'status@broadcast' || msg.from.includes('@g.us') || msg.isStatus) return;

    const from = msg.from;
    const session = this.userSessions.get(from) || { state: 'IDLE', timestamp: Date.now() };

    // Reset por inatividade (10 minutos para fluxos longos)
    if (Date.now() - session.timestamp > 600000) {
      session.state = 'IDLE';
    }
    session.timestamp = Date.now();

    if (session.state === 'HUMAN') return;

    const config = this.getBotConfig();
    if (!config.enabled) return;

    const text = msg.body.trim();

    // --- ESTADO INICIAL (ROOT): ESCOLHA DA REDE ---
    if (session.state === 'IDLE' || session.state === 'ROOT') {
      const contact = await msg.getContact();
      const clientName = contact.pushname || 'amigo(a)';
      session.clientName = clientName;

      let menuMsg = `${config.welcomeMessage.replace(/\{\{nome\}\}/gi, clientName)}\n\n`;
      config.brands.forEach((brand, idx) => {
        menuMsg += `${idx + 1}️⃣ ${brand.label}\n`;
      });
      
      session.state = 'SELECTING_BRAND';
      this.userSessions.set(from, session);
      await this.client.sendMessage(from, menuMsg);
      return;
    }

    // --- SELEÇÃO DE REDE ---
    if (session.state === 'SELECTING_BRAND') {
      const choice = parseInt(text) - 1;
      const brand = config.brands[choice];

      if (!brand) {
        await this.client.sendMessage(from, `❌ Opção inválida. Por favor, escolha Arco-Mix ou Arco-Vita digitando o número correspondente.`);
        return;
      }

      session.selectedBrandId = brand.id;
      session.selectedBrandName = brand.name;
      session.state = 'SELECTING_STORE';
      this.userSessions.set(from, session);

      let storeMsg = `🏪 *Qual unidade da ${brand.name} você está falando?*\n\n`;
      brand.stores.forEach((store, idx) => {
        storeMsg += `${idx + 1}. ${store}\n`;
      });
      storeMsg += `\nDigite o *número da loja* ou *0* para voltar.`;
      
      await this.client.sendMessage(from, storeMsg);
      return;
    }

    // --- SELEÇÃO DE LOJA ---
    if (session.state === 'SELECTING_STORE') {
      if (text === '0') {
        session.state = 'ROOT';
        this.userSessions.set(from, session);
        await this.handleIncomingMessage(msg);
        return;
      }

      const brand = config.brands.find(b => b.id === session.selectedBrandId);
      const choice = parseInt(text) - 1;
      const store = brand?.stores[choice];

      if (!brand || !store) {
        await this.client.sendMessage(from, `❌ Loja inválida. Digite o número correspondente à sua loja ou *0* para voltar.`);
        return;
      }

      session.selectedStore = store;
      session.state = 'MAIN_MENU';
      this.userSessions.set(from, session);

      // Menu Final Personalizado
      let menuMsg = `📍 *${brand.name} - ${store}*\nComo podemos te ajudar hoje?\n\n`;
      brand.menu.forEach((opt, idx) => {
        menuMsg += `${idx + 1}️⃣ ${opt.label}\n`;
      });
      menuMsg += `\n0️⃣ Voltar`;

      await this.client.sendMessage(from, menuMsg);
      return;
    }

    // --- MENU DE AÇÕES FINAL ---
    if (session.state === 'MAIN_MENU') {
      if (text === '0') {
        session.state = 'SELECTING_STORE';
        this.userSessions.set(from, session);
        // Re-envia lista de lojas
        const brand = config.brands.find(b => b.id === session.selectedBrandId);
        let storeMsg = `🏪 *Qual unidade da ${brand?.name} você está falando?*\n\n`;
        brand?.stores.forEach((store, idx) => {
          storeMsg += `${idx + 1}. ${store}\n`;
        });
        storeMsg += `\nDigite o número ou 0 para voltar ao início.`;
        await this.client.sendMessage(from, storeMsg);
        return;
      }

      const brand = config.brands.find(b => b.id === session.selectedBrandId);
      const choice = parseInt(text) - 1;
      const option = brand?.menu[choice];

      if (!option) {
        await this.client.sendMessage(from, `❌ Opção inválida. Escolha um número do menu ou 0 para voltar.`);
        return;
      }

      const replaceVars = (str: string) => {
        return (str || '')
          .replace(/\{\{nome\}\}/gi, session.clientName || 'Cliente')
          .replace(/\{\{rede\}\}/gi, session.selectedBrandName || '')
          .replace(/\{\{loja\}\}/gi, session.selectedStore || '');
      };

      if (option.action === 'HUMAN') {
        session.state = 'HUMAN';
        session.humanHandoverTimestamp = Date.now();
        session.humanTimeoutTriggered = false;
        this.userSessions.set(from, session);
        await this.client.sendMessage(from, replaceVars(option.content));
      } else if (option.action === 'WEBHOOK') {
        const webhookUrl = replaceVars(option.content);
        await this.client.sendMessage(from, `⚙️ Processando sua solicitação no sistema...\nPor favor, aguarde.`);
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: from,
              name: session.clientName,
              brand: session.selectedBrandName,
              store: session.selectedStore,
              timestamp: new Date().toISOString()
            })
          });
          await this.client.sendMessage(from, `✅ Solicitação registrada com sucesso no sistema (Integração customizada executada)!`);
        } catch (e) {
          this.logger.error(`Erro ao engatilhar função/webhook no URL ${webhookUrl}`);
          await this.client.sendMessage(from, `❌ Houve uma pequena instabilidade ao acionar o sistema interno. Tente novamente mais tarde.\n\nDigite *0* para voltar ao menu.`);
        }
      } else {
        await this.client.sendMessage(from, `${replaceVars(option.content)}\n\nDigite *0* para voltar ao menu.`);
      }
      return;
    }
  }

  private async processHumanTimeouts() {
    const config = this.getBotConfig();
    if (!config.enabled || !config.humanTimeoutMessage) return;

    const timeoutMs = (config.humanTimeoutMinutes || 5) * 60000;
    const now = Date.now();

    for (const [from, session] of this.userSessions.entries()) {
      if (
        session.state === 'HUMAN' && 
        !session.humanTimeoutTriggered && 
        session.humanHandoverTimestamp &&
        (now - session.humanHandoverTimestamp) >= timeoutMs
      ) {
        try {
          const msg = config.humanTimeoutMessage.replace(/\{\{nome\}\}/gi, session.clientName || 'Cliente');
          await this.client.sendMessage(from, msg);
          
          session.humanTimeoutTriggered = true;
          this.userSessions.set(from, session);
          
          this.logger.log(`Mensagem de alta demanda enviada para ${from}`);
        } catch (err) {
          this.logger.error(`Erro ao enviar timeout humano para ${from}: ${err.message}`);
        }
      }
    }
  }
}
