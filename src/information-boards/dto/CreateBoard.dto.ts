import { ApiProperty } from '@nestjs/swagger';
import { Multer } from 'multer';

export class CreateBoardDto {
  @ApiProperty({
    example: 'Community Events Board',
    description: 'The title of the information board',
  })
  title: string;

  @ApiProperty({
    example: 'events',
    description:
      'The category of the information board (e.g., events, announcements, resources)',
  })
  category: string;

  @ApiProperty({
    example: 'embassy-uuid',
    description: 'The ID of the embassy this board belongs to',
    required: true,
  })
  embassy_id: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The image of the information board',
    required: false,
  })
  image?: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Attachments related to the information board',
    required: false,
  })
  attachments?: Array<Multer.File>;

  @ApiProperty({
    example:
      'This board contains all upcoming community events and announcements...',
    description: 'The main content of the information board',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: true,
    description: 'The status of the information board',
    required: true,
  })
  is_active: boolean;

  @ApiProperty({
    example: 'UGANDA',
    description: 'Location of embassy',
    required: true,
  })
  location: string;

  @ApiProperty({
    example: 'user-12345',
    description: 'ID of the user creating the information board',
  })
  created_by: string;

  @ApiProperty({
    example: new Date(),
    description: 'Creation date of the information board',
  })
  created_at: Date;

  @ApiProperty({
    example: new Date(),
    description: 'Last update date of the information board',
  })
  updated_at: Date;
}
