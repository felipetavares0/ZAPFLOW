import { Test, TestingModule } from '@nestjs/testing';
import { WabaService } from './waba.service';

describe('WabaService', () => {
  let service: WabaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WabaService],
    }).compile();

    service = module.get<WabaService>(WabaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
