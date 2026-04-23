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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WabaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = __importDefault(require("axios"));
let WabaService = class WabaService {
    prisma;
    metaBaseUrl = 'https://graph.facebook.com/v19.0';
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createConfig(tenantId, data) {
        return this.prisma.wabaConfig.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }
    async getConfigsByTenant(tenantId) {
        return this.prisma.wabaConfig.findMany({
            where: { tenantId },
        });
    }
    async sendTemplateMessage(configId, to, templateName, languageCode, components) {
        const config = await this.prisma.wabaConfig.findUnique({
            where: { id: configId },
        });
        if (!config) {
            throw new common_1.HttpException('Configuração WABA não encontrada', common_1.HttpStatus.NOT_FOUND);
        }
        try {
            const response = await axios_1.default.post(`${this.metaBaseUrl}/${config.phoneNumberId}/messages`, {
                messaging_product: 'whatsapp',
                to,
                type: 'template',
                template: {
                    name: templateName,
                    language: { code: languageCode },
                    components,
                },
            }, {
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error) {
            const errorData = error.response?.data || error.message;
            throw new common_1.HttpException({ message: 'Falha ao enviar mensagem via Meta API', error: errorData }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getTemplates(configId) {
        const config = await this.prisma.wabaConfig.findUnique({
            where: { id: configId },
        });
        if (!config) {
            throw new common_1.HttpException('Configuração WABA não encontrada', common_1.HttpStatus.NOT_FOUND);
        }
        try {
            const response = await axios_1.default.get(`${this.metaBaseUrl}/${config.wabaId}/message_templates`, {
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                },
            });
            return response.data;
        }
        catch (error) {
            const errorData = error.response?.data || error.message;
            throw new common_1.HttpException({ message: 'Falha ao buscar templates da Meta API', error: errorData }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async createTemplate(configId, templateData) {
        const config = await this.prisma.wabaConfig.findUnique({
            where: { id: configId },
        });
        if (!config) {
            throw new common_1.HttpException('Configuração WABA não encontrada', common_1.HttpStatus.NOT_FOUND);
        }
        try {
            const response = await axios_1.default.post(`${this.metaBaseUrl}/${config.wabaId}/message_templates`, templateData, {
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error) {
            const errorData = error.response?.data || error.message;
            throw new common_1.HttpException({ message: 'Falha ao criar template na Meta API', error: errorData }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.WabaService = WabaService;
exports.WabaService = WabaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WabaService);
//# sourceMappingURL=waba.service.js.map