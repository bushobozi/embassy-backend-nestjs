import { Module } from '@nestjs/common';
import { EmbassyController } from './embassy.controller';
import { EmbassyService } from './embassy.service';

@Module({
  controllers: [EmbassyController],
  providers: [EmbassyService],
})
export class EmbassyModule {}
