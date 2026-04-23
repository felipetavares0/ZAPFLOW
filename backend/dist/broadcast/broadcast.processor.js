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
var BroadcastProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadcastProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const waba_service_1 = require("../waba/waba.service");
const common_1 = require("@nestjs/common");
let BroadcastProcessor = BroadcastProcessor_1 = class BroadcastProcessor extends bullmq_1.WorkerHost {
    wabaService;
    logger = new common_1.Logger(BroadcastProcessor_1.name);
    constructor(wabaService) {
        super();
        this.wabaService = wabaService;
    }
    async process(job) {
        const { configId, to, templateName, languageCode, components } = job.data;
        this.logger.log(`Processando envio para ${to} usando template ${templateName}`);
        try {
            const result = await this.wabaService.sendTemplateMessage(configId, to, templateName, languageCode, components);
            this.logger.log(`Mensagem enviada com sucesso para ${to}. ID: ${result.messages[0]?.id}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Falha ao enviar mensagem para ${to}: ${error.message}`);
            throw error;
        }
    }
};
exports.BroadcastProcessor = BroadcastProcessor;
exports.BroadcastProcessor = BroadcastProcessor = BroadcastProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('broadcast'),
    __metadata("design:paramtypes", [waba_service_1.WabaService])
], BroadcastProcessor);
//# sourceMappingURL=broadcast.processor.js.map