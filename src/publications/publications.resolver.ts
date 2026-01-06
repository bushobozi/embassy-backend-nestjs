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
import { PublicationsService } from './publications.service';

@ObjectType()
export class Publication {
  @Field(() => ID)
  id: string;

  @Field()
  embassy_id: string;

  @Field(() => String, { nullable: true })
  embassy_name: string | null;

  @Field(() => String, { nullable: true })
  embassy_picture: string;

  @Field()
  title: string;

  @Field()
  slug: string;

  @Field(() => String, { nullable: true })
  cover_image: string | null;

  @Field(() => String, { nullable: true })
  content: string | null;

  @Field(() => String, { nullable: true })
  publication_type: string | null;

  @Field(() => String, { nullable: true })
  attachments: string | null;

  @Field()
  status: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  published_at: Date | null;

  @Field()
  created_by: string;

  @Field(() => GraphQLISODateTime)
  created_at: Date;

  @Field(() => GraphQLISODateTime)
  updated_at: Date;
}

@ObjectType()
export class PaginationPublications {
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
export class PaginatedPublications {
  @Field(() => [Publication])
  data: Publication[];

  @Field(() => PaginationPublications)
  meta: PaginationPublications;
}

@Resolver(() => Publication)
export class PublicationsResolver {
  constructor(private publicationsService: PublicationsService) {}

  @Public()
  @Query(() => [Publication], { name: 'publications' })
  async getPublications(
    @Args('embassy_id', { type: () => String, nullable: true })
    embassy_id?: string,
    @Args('status', { type: () => String, nullable: true }) status?: string,
    @Args('publication_type', {
      type: () => String,
      nullable: true,
    })
    publication_type?: string,
    @Args('page', { type: () => Number, nullable: true }) page?: number,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
  ) {
    const publications = await this.publicationsService.findAll({
      embassy_id,
      status,
      publication_type,
      page,
      limit,
    });
    return publications.data;
  }
}
