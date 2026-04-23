import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  findAll(@Request() req) {
    return this.leadsService.findAll(req.user.tenantId);
  }

  @Post()
  create(@Request() req, @Body() body: { name?: string; number: string; tags?: string[] }) {
    return this.leadsService.create(req.user.tenantId, body);
  }

  @Post('import')
  importBulk(@Request() req, @Body() leads: { name?: string; number: string; tags?: string[] }[]) {
    return this.leadsService.importBulk(req.user.tenantId, leads);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
