import { Queue } from 'bullmq';
export declare class BroadcastService {
    private broadcastQueue;
    constructor(broadcastQueue: Queue);
    queueMessage(data: {
        configId: string;
        to: string;
        templateName: string;
        languageCode: string;
        components: any[];
    }): Promise<import("bullmq").Job<any, any, string>>;
    queueBulkMessages(messages: any[]): Promise<import("bullmq").Job<any, any, string>[]>;
}
