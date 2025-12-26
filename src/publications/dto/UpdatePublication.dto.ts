import { ApiProperty } from '@nestjs/swagger';
import { Multer } from 'multer';

export class UpdatePublicationDto {
  @ApiProperty({
    example: 'Advancements in Renewable Energy Technologies',
    description: 'The title of the publication',
  })
  title?: string;

  @ApiProperty({
    example: 'advancements-in-renewable-energy-technologies',
    description: 'The slug for the publication URL',
  })
  slug?: string;

  @ApiProperty({
    example: 'research_paper',
    description:
      'The type of the publication (e.g., research_paper, article, report)',
  })
  publication_type?: string;

  @ApiProperty({
    example:
      'This publication explores the latest advancements in renewable energy technologies...',
    description: 'The main content of the publication',
  })
  content?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The cover image of the publication',
    required: false,
  })
  cover_image?: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Attachments related to the publication',
    required: false,
  })
  attachments?: Array<Multer.File>;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
    },
    example: ['renewable energy', 'sustainability', 'technology'],
    description: 'Tags associated with the publication',
    required: false,
  })
  tags?: string[];

  @ApiProperty({
    example: 'draft',
    description:
      'The status of the publication (e.g., draft, published, archived)',
  })
  status?: string;

  @ApiProperty({
    example: 1,
    description: 'The ID of the user who created the publication',
    required: false,
  })
  created_by?: number;

  @ApiProperty({
    example: 1,
    description: 'The embassy ID associated with the publication',
    required: false,
  })
  embassy_id?: number;
}
