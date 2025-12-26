import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import {
  CreateChatroomDto,
  CreateChatMessageDto,
  CreateEmailDto,
  CreateNotificationDto,
  QueryEmailsDto,
} from './export-messages';

@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // ==================== CHATROOMS ====================

  @Post('chatrooms')
  @ApiOperation({ summary: 'Create a new chatroom' })
  @ApiResponse({
    status: 201,
    description: 'Chatroom created successfully',
  })
  createChatroom(@Body() createChatroomDto: CreateChatroomDto) {
    return this.messagesService.createChatroom(createChatroomDto);
  }

  @Get('chatrooms')
  @ApiOperation({ summary: 'Get all chatrooms' })
  @ApiQuery({
    name: 'embassy_id',
    required: false,
    type: Number,
    description: 'Filter by embassy ID',
  })
  @ApiQuery({
    name: 'user_id',
    required: false,
    type: Number,
    description: 'Filter by user ID (chatrooms where user is a member)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of chatrooms retrieved successfully',
  })
  findAllChatrooms(
    @Query('embassy_id') embassy_id?: number,
    @Query('user_id') user_id?: number,
  ) {
    return this.messagesService.findAllChatrooms(
      embassy_id ? Number(embassy_id) : undefined,
      user_id ? Number(user_id) : undefined,
    );
  }

  @Get('chatrooms/:id')
  @ApiOperation({ summary: 'Get a specific chatroom by ID' })
  @ApiResponse({
    status: 200,
    description: 'Chatroom retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Chatroom not found',
  })
  findChatroom(@Param('id') id: string) {
    return this.messagesService.findChatroom(id);
  }

  @Patch('chatrooms/:id/members/add')
  @ApiOperation({ summary: 'Add a member to a chatroom' })
  @ApiResponse({
    status: 200,
    description: 'Member added successfully',
  })
  addMemberToChatroom(
    @Param('id') id: string,
    @Body('user_id') userId: number,
  ) {
    return this.messagesService.addMemberToChatroom(id, userId);
  }

  @Patch('chatrooms/:id/members/remove')
  @ApiOperation({ summary: 'Remove a member from a chatroom' })
  @ApiResponse({
    status: 200,
    description: 'Member removed successfully',
  })
  removeMemberFromChatroom(
    @Param('id') id: string,
    @Body('user_id') userId: number,
  ) {
    return this.messagesService.removeMemberFromChatroom(id, userId);
  }

  // ==================== CHAT MESSAGES ====================

  @Post('chatrooms/:id/messages')
  @ApiOperation({ summary: 'Send a message to a chatroom' })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
  })
  createChatMessage(
    @Param('id') chatroomId: string,
    @Body() createChatMessageDto: CreateChatMessageDto,
  ) {
    return this.messagesService.createChatMessage({
      ...createChatMessageDto,
      chatroom_id: chatroomId,
    });
  }

  @Get('chatrooms/:id/messages')
  @ApiOperation({ summary: 'Get all messages in a chatroom' })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
  })
  findChatMessages(@Param('id') chatroomId: string) {
    return this.messagesService.findChatMessages(chatroomId);
  }

  @Patch('chat-messages/:id/read')
  @ApiOperation({ summary: 'Mark a chat message as read' })
  @ApiResponse({
    status: 200,
    description: 'Message marked as read',
  })
  markChatMessageAsRead(@Param('id') id: string) {
    return this.messagesService.markChatMessageAsRead(id);
  }

  @Delete('chat-messages/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a chat message' })
  @ApiResponse({
    status: 200,
    description: 'Message deleted successfully',
  })
  deleteChatMessage(@Param('id') id: string) {
    return this.messagesService.deleteChatMessage(id);
  }

  // ==================== EMAILS ====================

  @Post('emails')
  @ApiOperation({ summary: 'Create a new email (draft or send)' })
  @ApiResponse({
    status: 201,
    description: 'Email created successfully',
  })
  createEmail(@Body() createEmailDto: CreateEmailDto) {
    return this.messagesService.createEmail(createEmailDto);
  }

  @Get('emails')
  @ApiOperation({ summary: 'Get all emails with filters' })
  @ApiResponse({
    status: 200,
    description: 'Emails retrieved successfully with pagination',
  })
  findAllEmails(@Query() queryParams: QueryEmailsDto) {
    return this.messagesService.findAllEmails(queryParams);
  }

  @Get('emails/inbox')
  @ApiOperation({ summary: 'Get inbox emails for a user' })
  @ApiQuery({
    name: 'user_id',
    required: true,
    type: Number,
    description: 'User ID',
  })
  @ApiQuery({
    name: 'embassy_id',
    required: false,
    type: Number,
    description: 'Filter by embassy ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Inbox emails retrieved successfully',
  })
  getInbox(
    @Query('user_id') userId: number,
    @Query('embassy_id') embassy_id?: number,
  ) {
    return this.messagesService.getInbox(
      Number(userId),
      embassy_id ? Number(embassy_id) : undefined,
    );
  }

  @Get('emails/sent')
  @ApiOperation({ summary: 'Get sent emails for a user' })
  @ApiQuery({
    name: 'user_id',
    required: true,
    type: Number,
    description: 'User ID',
  })
  @ApiQuery({
    name: 'embassy_id',
    required: false,
    type: Number,
    description: 'Filter by embassy ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Sent emails retrieved successfully',
  })
  getSentEmails(
    @Query('user_id') userId: number,
    @Query('embassy_id') embassy_id?: number,
  ) {
    return this.messagesService.getSentEmails(
      Number(userId),
      embassy_id ? Number(embassy_id) : undefined,
    );
  }

  @Get('emails/drafts')
  @ApiOperation({ summary: 'Get draft emails for a user' })
  @ApiQuery({
    name: 'user_id',
    required: true,
    type: Number,
    description: 'User ID',
  })
  @ApiQuery({
    name: 'embassy_id',
    required: false,
    type: Number,
    description: 'Filter by embassy ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Draft emails retrieved successfully',
  })
  getDrafts(
    @Query('user_id') userId: number,
    @Query('embassy_id') embassy_id?: number,
  ) {
    return this.messagesService.getDrafts(
      Number(userId),
      embassy_id ? Number(embassy_id) : undefined,
    );
  }

  @Get('emails/archived')
  @ApiOperation({ summary: 'Get archived emails for a user' })
  @ApiQuery({
    name: 'user_id',
    required: true,
    type: Number,
    description: 'User ID',
  })
  @ApiQuery({
    name: 'embassy_id',
    required: false,
    type: Number,
    description: 'Filter by embassy ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Archived emails retrieved successfully',
  })
  getArchivedEmails(
    @Query('user_id') userId: number,
    @Query('embassy_id') embassy_id?: number,
  ) {
    return this.messagesService.getArchivedEmails(
      Number(userId),
      embassy_id ? Number(embassy_id) : undefined,
    );
  }

  @Get('emails/:id')
  @ApiOperation({ summary: 'Get a specific email by ID' })
  @ApiResponse({
    status: 200,
    description: 'Email retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Email not found',
  })
  findEmail(@Param('id') id: string) {
    return this.messagesService.findEmail(id);
  }

  @Patch('emails/:id/read')
  @ApiOperation({ summary: 'Mark an email as read' })
  @ApiResponse({
    status: 200,
    description: 'Email marked as read',
  })
  markEmailAsRead(@Param('id') id: string) {
    return this.messagesService.markEmailAsRead(id);
  }

  @Patch('emails/:id/draft')
  @ApiOperation({ summary: 'Mark an email as draft' })
  @ApiResponse({
    status: 200,
    description: 'Email marked as draft',
  })
  markEmailAsDraft(@Param('id') id: string) {
    return this.messagesService.markEmailAsDraft(id);
  }

  @Patch('emails/:id/archive')
  @ApiOperation({ summary: 'Archive an email' })
  @ApiResponse({
    status: 200,
    description: 'Email archived successfully',
  })
  archiveEmail(@Param('id') id: string) {
    return this.messagesService.archiveEmail(id);
  }

  @Patch('emails/:id/delete')
  @ApiOperation({ summary: 'Mark an email as deleted' })
  @ApiResponse({
    status: 200,
    description: 'Email marked as deleted',
  })
  deleteEmail(@Param('id') id: string) {
    return this.messagesService.deleteEmail(id);
  }

  @Patch('emails/:id/schedule')
  @ApiOperation({ summary: 'Schedule an email to be sent later' })
  @ApiResponse({
    status: 200,
    description: 'Email scheduled successfully',
  })
  scheduleEmail(
    @Param('id') id: string,
    @Body('scheduled_at') scheduledAt: Date,
  ) {
    return this.messagesService.scheduleEmail(id, new Date(scheduledAt));
  }

  // ==================== NOTIFICATIONS ====================

  @Post('notifications')
  @ApiOperation({ summary: 'Create a notification (admin use)' })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
  })
  createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.messagesService.createNotification(createNotificationDto);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get notifications for a user' })
  @ApiQuery({
    name: 'user_id',
    required: true,
    type: Number,
    description: 'User ID',
  })
  @ApiQuery({
    name: 'unread_only',
    required: false,
    type: Boolean,
    description: 'Filter unread notifications only',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  findUserNotifications(
    @Query('user_id') userId: number,
    @Query('unread_only') unreadOnly?: string,
  ) {
    return this.messagesService.findUserNotifications(
      Number(userId),
      unreadOnly === 'true',
    );
  }

  @Patch('notifications/:id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
  })
  markNotificationAsRead(@Param('id') id: string) {
    return this.messagesService.markNotificationAsRead(id);
  }

  @Patch('notifications/mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read for a user' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
  })
  markAllNotificationsAsRead(@Body('user_id') userId: number) {
    return this.messagesService.markAllNotificationsAsRead(userId);
  }

  @Delete('notifications/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
  })
  deleteNotification(@Param('id') id: string) {
    return this.messagesService.deleteNotification(id);
  }

  // ==================== STATISTICS ====================

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get messaging statistics for a user' })
  @ApiQuery({
    name: 'user_id',
    required: true,
    type: Number,
    description: 'User ID',
  })
  @ApiQuery({
    name: 'embassy_id',
    required: false,
    type: Number,
    description: 'Filter by embassy ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Messaging statistics retrieved successfully',
  })
  getMessagingStats(
    @Query('user_id') userId: number,
    @Query('embassy_id') embassy_id?: number,
  ) {
    return this.messagesService.getMessagingStats(
      Number(userId),
      embassy_id ? Number(embassy_id) : undefined,
    );
  }
}
