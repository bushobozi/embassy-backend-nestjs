import { Test, TestingModule } from '@nestjs/testing';
import { InformationBoardService } from './information-boards.service';

describe('InformationBoardService', () => {
  let service: InformationBoardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InformationBoardService],
    }).compile();

    service = module.get<InformationBoardService>(InformationBoardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
