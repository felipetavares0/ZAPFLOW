import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { WabaService } from '../waba/waba.service';
export declare class BroadcastProcessor extends WorkerHost {
    private wabaService;
    private readonly logger;
    constructor(wabaService: WabaService);
    process(job: Job<any, any, string>): Promise<any>;
}
