// events resolver.ts

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
import { EventsService } from './events.service';

@ObjectType()
export class Event {
  @Field(() => ID)
  id: string;

  @Field()
  embassy_id: string;

  @Field()
  event_name: string;

  @Field(() => String, { nullable: true })
  event_description: string | null;

  @Field(() => GraphQLISODateTime)
  event_start_date: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  event_end_date: Date | null;

  @Field(() => String, { nullable: true })
  event_image: string | null;

  @Field(() => String, { nullable: true })
  event_location: string | null;

  @Field(() => Boolean)
  is_active: boolean;

  @Field(() => Boolean)
  is_virtual: boolean;

  @Field(() => Boolean)
  is_paid: boolean;

  @Field(() => Boolean)
  is_public: boolean;

  @Field(() => Boolean)
  is_private: boolean;

  @Field(() => String, { nullable: true })
  event_type: string | null;

  @Field(() => Number, { nullable: true })
  event_cost: number | null;

  @Field(() => Number, { nullable: true })
  max_attendees: number | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  registration_deadline: Date | null;

  @Field(() => GraphQLISODateTime)
  created_at: Date;

  @Field()
  created_by: string;

  @Field(() => GraphQLISODateTime)
  updated_at: Date;
}

@ObjectType()
export class PaginationMeta {
  @Field()
  total: number;

  @Field()
  page: number;

  @Field()
  limit: number;

  @Field()
  totalPages: number;
}

@ObjectType()
export class PaginatedEvents {
  @Field(() => [Event])
  data: Event[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}

@Resolver(() => Event)
export class EventsResolver {
  constructor(private readonly eventsService: EventsService) {}

  @Public()
  @Query(() => [Event], { name: 'events' })
  async getEvents(
    @Args('embassy_id', { type: () => String, nullable: true })
    embassy_id?: string,
    @Args('is_active', { type: () => Boolean, nullable: true })
    is_active?: boolean,
    @Args('is_virtual', { type: () => Boolean, nullable: true })
    is_virtual?: boolean,
    @Args('is_paid', { type: () => Boolean, nullable: true }) is_paid?: boolean,
    @Args('is_public', { type: () => Boolean, nullable: true })
    is_public?: boolean,
    @Args('event_type', { type: () => String, nullable: true })
    event_type?: string,
    @Args('page', { type: () => Number, nullable: true, defaultValue: 1 })
    page: number = 1,
    @Args('limit', { type: () => Number, nullable: true, defaultValue: 25 })
    limit: number = 25,
  ) {
    const events = await this.eventsService.findAll({
      embassy_id,
      is_active,
      is_virtual,
      is_paid,
      is_public,
      event_type,
      page,
      limit,
    });
    return events.data;
  }
}
