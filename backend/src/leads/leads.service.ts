import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.lead.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(tenantId: string, data: { name?: string; number: string; tags?: string[] }) {
    return this.prisma.lead.upsert({
      where: {
        number_tenantId: {
          number: data.number,
          tenantId: tenantId,
        },
      },
      update: {
        name: data.name,
        tags: data.tags,
      },
      create: {
        ...data,
        tenantId,
      },
    });
  }

  async importBulk(tenantId: string, leads: { name?: string; number: string; tags?: string[] }[]) {
    const results: any[] = [];
    for (const lead of leads) {
      results.push(await this.create(tenantId, lead));
    }
    return { count: results.length };
  }

  async remove(id: string) {
    return this.prisma.lead.delete({
      where: { id },
    });
  }
}
