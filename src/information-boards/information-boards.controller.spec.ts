import { Test, TestingModule } from '@nestjs/testing';
import { InformationBoardsController } from './information-boards.controller';

describe('InformationBoardsController', () => {
  let controller: InformationBoardsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InformationBoardsController],
    }).compile();

    controller = module.get<InformationBoardsController>(InformationBoardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
