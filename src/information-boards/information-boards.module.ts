import { Module } from '@nestjs/common';
import { InformationBoardService } from './information-boards.service';
import { InformationBoardsController } from './information-boards.controller';
import { InformationBoardsResolver } from './information-boards.resolver';

@Module({
  providers: [InformationBoardService, InformationBoardsResolver],
  controllers: [InformationBoardsController],
})
export class InformationBoardsModule {}
