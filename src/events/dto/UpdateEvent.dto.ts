import { ApiProperty } from '@nestjs/swagger';

export class UpdateEventDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The image of the event',
    required: false,
  })
  event_image?: string;
  @ApiProperty({
    example: 'International Tech Conference 2024',
    description: 'The name of the event',
  })
  event_name?: string;
  @ApiProperty({
    example:
      'A conference bringing together tech enthusiasts from around the world.',
    description: 'The description of the event',
  })
  event_description?: string;
  @ApiProperty({
    example: '2024-09-15T09:00:00Z',
    description: 'The start date and time of the event',
  })
  event_start_date: Date;
  @ApiProperty({
    example: '2024-09-17T17:00:00Z',
    description: 'The end date and time of the event',
  })
  event_end_date?: Date;
  @ApiProperty({
    example: '123 Conference Ave, Tech City, Country',
    description: 'The location of the event',
  })
  event_location?: string;
  @ApiProperty({
    example: 'conference',
    description: 'The type of the event (e.g., conference, workshop, seminar)',
  })
  event_type?: string;
  @ApiProperty({
    example: false,
    description: 'Indicates if the event is virtual',
  })
  is_virtual?: boolean;
  @ApiProperty({
    example: true,
    description: 'Indicates if the event is active',
  })
  is_active?: boolean;
  @ApiProperty({
    example: true,
    description: 'Indicates if the event is public',
  })
  is_public?: boolean;
  @ApiProperty({
    example: false,
    description: 'Indicates if the event is private',
  })
  is_private?: boolean;
  @ApiProperty({
    example: false,
    description: 'Indicates if the event is paid',
  })
  is_paid?: boolean;
  @ApiProperty({
    example: 0,
    description: 'The cost of the event',
  })
  event_cost?: number;
  @ApiProperty({
    example: 100,
    description: 'The maximum number of attendees for the event',
  })
  max_attendees?: number;
  @ApiProperty({
    example: '2024-09-10T23:59:59Z',
    description: 'The registration deadline for the event',
  })
  registration_deadline?: Date;
  @ApiProperty({
    example: 1,
    description: 'The embassy ID associated with the event',
  })
  embassy_id?: number;
}
