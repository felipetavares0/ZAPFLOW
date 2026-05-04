"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var WhatsappService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_web_js_1 = require("whatsapp-web.js");
const QRCode = __importStar(require("qrcode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let WhatsappService = WhatsappService_1 = class WhatsappService {
    logger = new common_1.Logger(WhatsappService_1.name);
    client;
    status = 'INITIALIZING';
    qrCodeBase64 = null;
    messageLog = [];
    totalSent = 0;
    totalFailed = 0;
    stopRequested = false;
    CONFIG_PATH = path.join(__dirname, 'config', 'bot-config.json');
    userSessions = new Map();
    onModuleInit() {
        this.initClient();
    }
    initClient() {
        this.status = 'INITIALIZING';
        this.client = new whatsapp_web_js_1.Client({
            authStrategy: new whatsapp_web_js_1.LocalAuth({
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
                    '--disable-gpu',
                    '--proxy-server="direct://"',
                    '--proxy-bypass-list=*'
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
            }
            catch (err) {
                this.logger.error(`Erro ao processar mensagem do bot: ${err.message}`);
            }
        });
        this.client.initialize().catch((err) => {
            this.logger.error(`Erro ao inicializar cliente: ${err.message}`);
            this.status = 'DISCONNECTED';
        });
        setInterval(() => this.processHumanTimeouts(), 60000);
    }
    getStatus() {
        return {
            status: this.status,
            qrCode: this.qrCodeBase64,
            totalSent: this.totalSent,
            totalFailed: this.totalFailed,
        };
    }
    getMessageLog() {
        return this.messageLog.slice(-50);
    }
    async sendMessage(number, message, media) {
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
                const wppMedia = new whatsapp_web_js_1.MessageMedia(media.mimetype, media.data, media.filename);
                await this.client.sendMessage(chatId, wppMedia, { caption: message });
            }
            else {
                await this.client.sendMessage(chatId, message);
            }
            this.totalSent++;
            this.messageLog.push({ number, message, status: 'sent', time: new Date() });
            return { success: true };
        }
        catch (error) {
            this.totalFailed++;
            this.messageLog.push({ number, message, status: 'failed', time: new Date() });
            return { success: false, error: error.message };
        }
    }
    async sendBulk(contacts, message, delayMs = 3000, media) {
        if (this.status !== 'CONNECTED') {
            return { sent: 0, failed: contacts.length, errors: ['WhatsApp não está conectado.'] };
        }
        this.stopRequested = false;
        let sent = 0;
        let failed = 0;
        const errors = [];
        for (const contact of contacts) {
            if (this.stopRequested)
                break;
            const personalizedMsg = message.replace(/\{\{nome\}\}/gi, contact.name || 'Cliente');
            const result = await this.sendMessage(contact.number, personalizedMsg, media);
            if (result.success) {
                sent++;
            }
            else {
                failed++;
                errors.push(`${contact.number}: ${result.error}`);
            }
            if (contacts.indexOf(contact) < contacts.length - 1) {
                await new Promise((r) => setTimeout(r, delayMs + Math.random() * 2000));
            }
        }
        return { sent, failed, errors };
    }
    async logout() {
        try {
            await this.client.logout();
            this.status = 'DISCONNECTED';
            this.stopRequested = false;
            this.qrCodeBase64 = null;
            this.logger.log('Sessão encerrada.');
            setTimeout(() => this.initClient(), 2000);
        }
        catch (error) {
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
        }
        catch {
            return { enabled: false, welcomeMessage: '', brands: [] };
        }
    }
    saveBotConfig(config) {
        fs.writeFileSync(this.CONFIG_PATH, JSON.stringify(config, null, 2));
        return { success: true };
    }
    getBotTemplates() {
        try {
            const templates = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'bot-templates.json'), 'utf8'));
            return templates;
        }
        catch {
            return [];
        }
    }
    getBotSessions() {
        const sessions = [];
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
    async handleIncomingMessage(msg) {
        if (msg.from === 'status@broadcast' || msg.from.includes('@g.us') || msg.isStatus)
            return;
        const from = msg.from;
        const session = this.userSessions.get(from) || { state: 'IDLE', timestamp: Date.now() };
        if (Date.now() - session.timestamp > 600000) {
            session.state = 'IDLE';
        }
        session.timestamp = Date.now();
        if (session.state === 'HUMAN')
            return;
        const config = this.getBotConfig();
        if (!config.enabled)
            return;
        const text = msg.body.trim();
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
            let menuMsg = `📍 *${brand.name} - ${store}*\nComo podemos te ajudar hoje?\n\n`;
            brand.menu.forEach((opt, idx) => {
                menuMsg += `${idx + 1}️⃣ ${opt.label}\n`;
            });
            menuMsg += `\n0️⃣ Voltar`;
            await this.client.sendMessage(from, menuMsg);
            return;
        }
        if (session.state === 'MAIN_MENU') {
            if (text === '0') {
                session.state = 'SELECTING_STORE';
                this.userSessions.set(from, session);
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
            const replaceVars = (str) => {
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
            }
            else if (option.action === 'WEBHOOK') {
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
                }
                catch (e) {
                    this.logger.error(`Erro ao engatilhar função/webhook no URL ${webhookUrl}`);
                    await this.client.sendMessage(from, `❌ Houve uma pequena instabilidade ao acionar o sistema interno. Tente novamente mais tarde.\n\nDigite *0* para voltar ao menu.`);
                }
            }
            else {
                await this.client.sendMessage(from, `${replaceVars(option.content)}\n\nDigite *0* para voltar ao menu.`);
            }
            return;
        }
    }
    async processHumanTimeouts() {
        const config = this.getBotConfig();
        if (!config.enabled || !config.humanTimeoutMessage)
            return;
        const timeoutMs = (config.humanTimeoutMinutes || 5) * 60000;
        const now = Date.now();
        for (const [from, session] of this.userSessions.entries()) {
            if (session.state === 'HUMAN' &&
                !session.humanTimeoutTriggered &&
                session.humanHandoverTimestamp &&
                (now - session.humanHandoverTimestamp) >= timeoutMs) {
                try {
                    const msg = config.humanTimeoutMessage.replace(/\{\{nome\}\}/gi, session.clientName || 'Cliente');
                    await this.client.sendMessage(from, msg);
                    session.humanTimeoutTriggered = true;
                    this.userSessions.set(from, session);
                    this.logger.log(`Mensagem de alta demanda enviada para ${from}`);
                }
                catch (err) {
                    this.logger.error(`Erro ao enviar timeout humano para ${from}: ${err.message}`);
                }
            }
        }
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = WhatsappService_1 = __decorate([
    (0, common_1.Injectable)()
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map