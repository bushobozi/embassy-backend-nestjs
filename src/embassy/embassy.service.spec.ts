import { Test, TestingModule } from '@nestjs/testing';
import { EmbassyService } from './embassy.service';

describe('EmbassyService', () => {
  let service: EmbassyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmbassyService],
    }).compile();

    service = module.get<EmbassyService>(EmbassyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
