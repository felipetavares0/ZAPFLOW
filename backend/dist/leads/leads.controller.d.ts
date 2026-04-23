import { LeadsService } from './leads.service';
export declare class LeadsController {
    private readonly leadsService;
    constructor(leadsService: LeadsService);
    findAll(req: any): Promise<{
        number: string;
        name: string | null;
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        lastInteraction: Date | null;
    }[]>;
    create(req: any, body: {
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
    importBulk(req: any, leads: {
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
