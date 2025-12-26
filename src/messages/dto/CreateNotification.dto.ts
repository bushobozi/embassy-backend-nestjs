import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({
    example: 1,
    description: 'The ID of the user receiving the notification',
  })
  user_id: number;

  @ApiProperty({
    example: 'New message received',
    description: 'The title of the notification',
  })
  title: string;

  @ApiProperty({
    example: 'You have a new message from John Doe',
    description: 'The content of the notification',
  })
  message: string;

  @ApiProperty({
    example: 'chat',
    description: 'The type of notification',
    enum: ['chat', 'email', 'system', 'alert'],
  })
  type: string;

  @ApiProperty({
    example: '/messages/chat/uuid',
    description: 'Link related to the notification',
    required: false,
  })
  link?: string;

  @ApiProperty({
    example: false,
    description: 'Whether the notification has been read',
    default: false,
  })
  is_read: boolean;
}
