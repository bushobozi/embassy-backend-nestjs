import { Module } from '@nestjs/common';
import { PublicationsController } from './publications.controller';
import { PublicationsService } from './publications.service';
import { PublicationsResolver } from './publications.resolver';
@Module({
  controllers: [PublicationsController],
  providers: [PublicationsService, PublicationsResolver],
})
export class PublicationsModule {}
