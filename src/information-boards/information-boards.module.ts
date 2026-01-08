import { Module } from '@nestjs/common';
import { InformationBoardService } from './information-boards.service';
import { InformationBoardsController } from './information-boards.controller';

@Module({
  providers: [InformationBoardService],
  controllers: [InformationBoardsController],
})
export class InformationBoardsModule { }
