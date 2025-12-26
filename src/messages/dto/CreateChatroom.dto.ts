import { ApiProperty } from '@nestjs/swagger';

export class CreateChatroomDto {
  @ApiProperty({
    example: 'Project Discussion',
    description: 'The name of the chatroom',
  })
  name: string;

  @ApiProperty({
    example: 'Discussion room for project updates',
    description: 'Description of the chatroom',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'Array of user IDs who are members of the chatroom',
    type: [Number],
  })
  member_ids: number[];

  @ApiProperty({
    example: 1,
    description: 'The ID of the user who created the chatroom',
  })
  created_by: number;

  @ApiProperty({
    example: 1,
    description: 'The embassy ID associated with the chatroom',
  })
  embassy_id: number;
}
