import { BroadcastService } from './broadcast.service';
export declare class BroadcastController {
    private broadcastService;
    constructor(broadcastService: BroadcastService);
    triggerMessage(body: any): Promise<{
        success: boolean;
        jobId: string | undefined;
    }>;
    triggerBulk(body: {
        messages: any[];
    }): Promise<{
        success: boolean;
        count: number;
    }>;
}
