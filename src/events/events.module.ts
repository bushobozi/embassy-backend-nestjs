import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventsResolver } from './events.resolver';

@Module({
  controllers: [EventsController],
  providers: [EventsService, EventsResolver],
})
export class EventsModule {}
