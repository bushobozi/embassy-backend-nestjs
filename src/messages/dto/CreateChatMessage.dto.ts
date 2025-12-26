import { ApiProperty } from '@nestjs/swagger';

export class CreateChatMessageDto {
  @ApiProperty({
    example: 'chat-room-uuid',
    description: 'The ID of the chatroom',
  })
  chatroom_id: string;

  @ApiProperty({
    example: 'Hello everyone!',
    description: 'The content of the chat message',
  })
  content: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Attachments for the chat message',
    required: false,
  })
  attachments?: string[];

  @ApiProperty({
    example: 1,
    description: 'The ID of the user sending the message',
  })
  sender_id: number;
}
