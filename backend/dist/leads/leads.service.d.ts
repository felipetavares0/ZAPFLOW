import { PrismaService } from '../prisma/prisma.service';
export declare class LeadsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string): Promise<{
        number: string;
        name: string | null;
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        lastInteraction: Date | null;
    }[]>;
    create(tenantId: string, data: {
        name?: string;
        number: string;
        tags?: string[];
    }): Promise<{
        number: string;
        name: string | null;
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        lastInteraction: Date | null;
    }>;
    importBulk(tenantId: string, leads: {
        name?: string;
        number: string;
        tags?: string[];
    }[]): Promise<{
        count: number;
    }>;
    remove(id: string): Promise<{
        number: string;
        name: string | null;
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        lastInteraction: Date | null;
    }>;
}
