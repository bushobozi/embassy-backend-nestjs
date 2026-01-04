// tasks resolver.ts

import {
  Resolver,
  Query,
  ObjectType,
  Field,
  ID,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { Public } from '../auth/decorators/public.decorator';
import { TasksService } from './tasks.service';
import { Task as PrismaTask } from '@prisma/client';

@ObjectType()
export class Task {
  @Field(() => ID)
  id: string;

  @Field()
  embassy_id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  assigned_to: string;

  @Field()
  status: string;

  @Field()
  priority: string;

  @Field()
  is_urgent: boolean;

  @Field(() => GraphQLISODateTime)
  due_date: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  completed_at: Date;

  @Field(() => GraphQLISODateTime)
  created_at: Date;

  @Field(() => GraphQLISODateTime)
  updated_at: Date;
}

@Resolver(() => Task)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  @Public()
  @Query(() => [Task], { name: 'tasks' })
  async getTasks(): Promise<PrismaTask[]> {
    const result = await this.tasksService.findAll();
    return result.data;
  }
}
