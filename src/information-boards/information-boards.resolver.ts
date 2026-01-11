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
import { InformationBoardService } from './information-boards.service';

@ObjectType()
export class InformationBoard {
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

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => String, { nullable: true })
  category: string | null;

  @Field()
  is_active: boolean;

  @Field(() => String, { nullable: true })
  image: string | null;

  @Field(() => [String], { nullable: 'itemsAndList' })
  attachments: string[] | null;

  @Field(() => String, { nullable: true })
  location: string | null;

  @Field()
  created_by: string;

  @Field(() => GraphQLISODateTime)
  created_at: Date;

  @Field(() => GraphQLISODateTime)
  updated_at: Date;
}

@Resolver(() => InformationBoard)
export class InformationBoardsResolver {
  constructor(private informationBoardService: InformationBoardService) {}

  @Public()
  @Query(() => [InformationBoard], { name: 'informationBoards' })
  async getInformationBoards(
    @Args('embassy_id', { type: () => String, nullable: true })
    embassy_id?: string,
    @Args('is_active', { type: () => Boolean, nullable: true })
    is_active?: boolean,
    @Args('page', { type: () => Number, nullable: true })
    page?: number,
    @Args('limit', { type: () => Number, nullable: true })
    limit?: number,
  ) {
    const boards = await this.informationBoardService.findAll({
      embassy_id,
      is_active,
      page,
      limit,
    });
    return boards.data;
  }
}
