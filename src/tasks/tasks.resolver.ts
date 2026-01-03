// tasks resolver.ts

import { Resolver, Query, ObjectType, Field, ID } from '@nestjs/graphql';

import { TasksService } from './tasks.service';
import { Task as PrismaTask } from '@prisma/client';

@ObjectType()
export class Task {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  completed: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@Resolver(() => Task)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  @Query(() => [Task], { name: 'tasks' })
  async getTasks(): Promise<PrismaTask[]> {
    const result = await this.tasksService.findAll();
    return result.data;
  }
}
