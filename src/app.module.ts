import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmbassyModule } from './embassy/embassy.module';
import { UsersModule } from './users/users.module';
import { StaffModule } from './staff/staff.module';
import { EventsModule } from './events/events.module';
import { MessagesModule } from './messages/messages.module';
import { PublicationsModule } from './publications/publications.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    EmbassyModule,
    UsersModule,
    StaffModule,
    EventsModule,
    MessagesModule,
    PublicationsModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
