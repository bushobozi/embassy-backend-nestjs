import { Test, TestingModule } from '@nestjs/testing';
import { EmbassyController } from './embassy.controller';

describe('EmbassyController', () => {
  let controller: EmbassyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmbassyController],
    }).compile();

    controller = module.get<EmbassyController>(EmbassyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
