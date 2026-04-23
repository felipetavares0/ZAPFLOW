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
exports.WabaController = void 0;
const common_1 = require("@nestjs/common");
const waba_service_1 = require("./waba.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let WabaController = class WabaController {
    wabaService;
    constructor(wabaService) {
        this.wabaService = wabaService;
    }
    async createConfig(req, body) {
        return this.wabaService.createConfig(req.user.tenantId, body);
    }
    async getConfigs(req) {
        return this.wabaService.getConfigsByTenant(req.user.tenantId);
    }
    async sendTest(configId, body) {
        const { to, templateName, languageCode, components } = body;
        return this.wabaService.sendTemplateMessage(configId, to, templateName, languageCode || 'pt_BR', components || []);
    }
    async getTemplates(configId) {
        return this.wabaService.getTemplates(configId);
    }
    async createTemplate(configId, body) {
        return this.wabaService.createTemplate(configId, body);
    }
};
exports.WabaController = WabaController;
__decorate([
    (0, common_1.Post)('config'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WabaController.prototype, "createConfig", null);
__decorate([
    (0, common_1.Get)('configs'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WabaController.prototype, "getConfigs", null);
__decorate([
    (0, common_1.Post)('send-test/:configId'),
    __param(0, (0, common_1.Param)('configId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WabaController.prototype, "sendTest", null);
__decorate([
    (0, common_1.Get)('templates/:configId'),
    __param(0, (0, common_1.Param)('configId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WabaController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Post)('template/:configId'),
    __param(0, (0, common_1.Param)('configId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WabaController.prototype, "createTemplate", null);
exports.WabaController = WabaController = __decorate([
    (0, common_1.Controller)('waba'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [waba_service_1.WabaService])
], WabaController);
//# sourceMappingURL=waba.controller.js.map