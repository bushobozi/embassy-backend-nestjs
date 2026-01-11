import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({
    example: 'Community Events Board',
    description: 'The title of the information board',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'events',
    description:
      'The category of the information board (e.g., events, announcements, resources)',
  })
  @IsString()
  @IsOptional()
  category: string;

  @ApiProperty({
    example: 'embassy-uuid',
    description: 'The ID of the embassy this board belongs to',
    required: true,
  })
  @IsString()
  @IsOptional()
  embassy_id: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The image of the information board',
    required: false,
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
    },
    description: 'Attachments related to the information board (URLs)',
    required: false,
  })
  @IsArray()
  @IsOptional()
  attachments?: string[];

  @ApiProperty({
    example:
      'This board contains all upcoming community events and announcements...',
    description: 'The main content of the information board',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: true,
    description: 'The status of the information board',
    required: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_active: boolean;

  @ApiProperty({
    example: 'UGANDA',
    description: 'Location of embassy',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    example: 'user-12345',
    description: 'ID of the user creating the information board',
  })
  @IsString()
  @IsOptional()
  created_by: string;

  @ApiProperty({
    example: new Date(),
    description: 'Creation date of the information board',
  })
  @IsOptional()
  created_at: Date;

  @ApiProperty({
    example: new Date(),
    description: 'Last update date of the information board',
  })
  @IsOptional()
  updated_at: Date;
}
