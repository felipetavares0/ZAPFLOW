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
exports.BroadcastController = void 0;
const common_1 = require("@nestjs/common");
const broadcast_service_1 = require("./broadcast.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let BroadcastController = class BroadcastController {
    broadcastService;
    constructor(broadcastService) {
        this.broadcastService = broadcastService;
    }
    async triggerMessage(body) {
        try {
            const job = await this.broadcastService.queueMessage(body);
            return { success: true, jobId: job.id };
        }
        catch (error) {
            throw new common_1.HttpException({ message: 'Falha ao enfileirar mensagem', error: error.message }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async triggerBulk(body) {
        try {
            const jobs = await this.broadcastService.queueBulkMessages(body.messages);
            return { success: true, count: jobs.length };
        }
        catch (error) {
            throw new common_1.HttpException({ message: 'Falha ao enfileirar mensagens em massa', error: error.message }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.BroadcastController = BroadcastController;
__decorate([
    (0, common_1.Post)('trigger'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BroadcastController.prototype, "triggerMessage", null);
__decorate([
    (0, common_1.Post)('trigger-bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BroadcastController.prototype, "triggerBulk", null);
exports.BroadcastController = BroadcastController = __decorate([
    (0, common_1.Controller)('broadcast'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [broadcast_service_1.BroadcastService])
], BroadcastController);
//# sourceMappingURL=broadcast.controller.js.map