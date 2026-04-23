"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappController = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_service_1 = require("./whatsapp.service");
let WhatsappController = class WhatsappController {
    whatsappService;
    constructor(whatsappService) {
        this.whatsappService = whatsappService;
    }
    getStatus() {
        return this.whatsappService.getStatus();
    }
    getLog() {
        return this.whatsappService.getMessageLog();
    }
    getBotConfig() {
        return this.whatsappService.getBotConfig();
    }
    getBotSessions() {
        return this.whatsappService.getBotSessions();
    }
    getBotTemplates() {
        return this.whatsappService.getBotTemplates();
    }
    saveBotConfig(config) {
        return this.whatsappService.saveBotConfig(config);
    }
    async sendMessage(body) {
        return this.whatsappService.sendMessage(body.number, body.message);
    }
    async broadcast(body) {
        return this.whatsappService.sendBulk(body.contacts, body.message, body.delayMs || 3000, body.media);
    }
    stopBroadcast() {
        this.whatsappService.stopBulk();
        return { success: true, message: 'Interrupção solicitada com sucesso.' };
    }
    async logout() {
        await this.whatsappService.logout();
        return { success: true, message: 'Sessão encerrada com sucesso.' };
    }
};
exports.WhatsappController = WhatsappController;
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('log'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "getLog", null);
__decorate([
    (0, common_1.Get)('bot-config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "getBotConfig", null);
__decorate([
    (0, common_1.Get)('bot/sessions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "getBotSessions", null);
__decorate([
    (0, common_1.Get)('bot-templates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "getBotTemplates", null);
__decorate([
    (0, common_1.Post)('bot-config'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "saveBotConfig", null);
__decorate([
    (0, common_1.Post)('send'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('broadcast'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "broadcast", null);
__decorate([
    (0, common_1.Post)('stop'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "stopBroadcast", null);
__decorate([
    (0, common_1.Delete)('logout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "logout", null);
exports.WhatsappController = WhatsappController = __decorate([
    (0, common_1.Controller)('whatsapp'),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService])
], WhatsappController);
//# sourceMappingURL=whatsapp.controller.js.map