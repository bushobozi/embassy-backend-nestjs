// tasks resolver.ts

import {
  Resolver,
  Query,
  ObjectType,
  Field,
  ID,
  GraphQLISODateTime,
  Args,
} from '@nestjs/graphql';
import { Public } from '../auth/decorators/public.decorator';
import { TasksService } from './tasks.service';

@ObjectType()
class AssignedUser {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  first_name?: string;

  @Field({ nullable: true })
  middle_name?: string;

  @Field({ nullable: true })
  last_name?: string;
}

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

  @Field(() => AssignedUser)
  assigned_user?: AssignedUser;

  @Field()
  status: string;

  @Field()
  priority: string;

  @Field()
  is_urgent: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
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
  async getTasks(
    @Args('embassy_id', { type: () => String }) embassy_id: string,
    @Args('assigned_to', { type: () => String, nullable: true })
    assigned_to?: string,
    @Args('status', { type: () => String, nullable: true }) status?: string,
    @Args('priority', { type: () => String, nullable: true }) priority?: string,
    @Args('is_urgent', { type: () => Boolean, nullable: true })
    is_urgent?: boolean,
    @Args('created_by', { type: () => String, nullable: true })
    created_by?: string,
    @Args('page', { type: () => Number, nullable: true }) page?: number,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
  ) {
    const result = await this.tasksService.findAll({
      embassy_id,
      assigned_to,
      status,
      priority,
      is_urgent,
      created_by,
      page,
      limit,
    });
    return result.data;
  }
}
