import { ApiProperty } from '@nestjs/swagger';

export class CreateEmailDto {
  @ApiProperty({
    example: 1,
    description: 'The ID of the sender',
  })
  sender_id: number;

  @ApiProperty({
    example: [2, 3],
    description: 'Array of recipient user IDs',
    type: [Number],
  })
  receiver_ids: number[];

  @ApiProperty({
    example: 'Meeting Schedule',
    description: 'The subject of the email',
  })
  subject: string;

  @ApiProperty({
    example: 'This is the email content...',
    description: 'The content/body of the email',
  })
  content: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Attachments for the email',
    required: false,
  })
  attachments?: string[];

  @ApiProperty({
    example: 'draft',
    description: 'The status of the email',
    enum: ['draft', 'sent', 'read', 'archived', 'deleted', 'scheduled'],
    default: 'draft',
  })
  status: string;

  @ApiProperty({
    example: '2024-12-30T10:00:00Z',
    description: 'Scheduled time to send the email',
    required: false,
  })
  scheduled_at?: Date;

  @ApiProperty({
    example: 1,
    description: 'The embassy ID associated with the email',
  })
  embassy_id: number;
}
