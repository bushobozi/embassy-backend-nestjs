import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateChatroomDto {
  @ApiProperty({
    example: 'Project Discussion',
    description: 'The name of the chatroom',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Discussion room for project updates',
    description: 'Description of the chatroom',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: ['1', '2', '3'],
    description: 'Array of user IDs who are members of the chatroom',
    type: [String],
  })
  @IsArray()
  @IsOptional()
  member_ids?: string[];

  @ApiProperty({
    example: '1',
    description: 'The ID of the user who created the chatroom',
  })
  @IsString()
  @IsNotEmpty()
  created_by: string;

  @ApiProperty({
    example: '1',
    description: 'The embassy ID associated with the chatroom',
  })
  @IsString()
  @IsNotEmpty()
  embassy_id: string;
}
