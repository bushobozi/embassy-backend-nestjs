import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Rate limiting: 5 requests per 60 seconds per IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds in milliseconds
        limit: 5, // 5 requests per ttl window
      },
    ]),
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      // Disable playground and introspection in production
      playground: process.env.NODE_ENV !== 'production' && {
        settings: {
          'request.credentials': 'include',
        },
      },
      introspection: process.env.NODE_ENV !== 'production',
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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: () => new TimeoutInterceptor(30000), // 30 second timeout
    },
  ],
})
export class AppModule {}
