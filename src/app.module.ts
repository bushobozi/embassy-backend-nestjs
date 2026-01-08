import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { EmbassyModule } from './embassy/embassy.module';
import { UsersModule } from './users/users.module';
import { StaffModule } from './staff/staff.module';
import { EventsModule } from './events/events.module';
import { MessagesModule } from './messages/messages.module';
import { PublicationsModule } from './publications/publications.module';
import { TasksModule } from './tasks/tasks.module';
import { InformationBoardsModule } from './information-boards/information-boards.module';
import { NewsModule } from './news/news.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: {
        settings: {
          'request.credentials': 'include',
        },
      },
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
    }),
    PrismaModule,
    AuthModule,
    EmbassyModule,
    UsersModule,
    StaffModule,
    EventsModule,
    MessagesModule,
    PublicationsModule,
    TasksModule,
    InformationBoardsModule,
    NewsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
