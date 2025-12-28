import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { CreateChatMessageDto } from './export-messages';

@WebSocketGateway({
  cors: {
    origin: '*', // Configure this properly in production
  },
  namespace: '/messages',
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Track connected users and their chatrooms
  private userSockets: Map<number, string[]> = new Map(); // userId -> socketIds
  private socketUsers: Map<string, number> = new Map(); // socketId -> userId
  private chatroomMembers: Map<string, Set<string>> = new Map(); // chatroomId -> socketIds

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    // Clean up user tracking
    const userId = this.socketUsers.get(client.id);
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        const index = sockets.indexOf(client.id);
        if (index > -1) {
          sockets.splice(index, 1);
        }
        if (sockets.length === 0) {
          this.userSockets.delete(userId);
        }
      }
      this.socketUsers.delete(client.id);
    }

    // Clean up chatroom tracking
    this.chatroomMembers.forEach((members, chatroomId) => {
      if (members.has(client.id)) {
        members.delete(client.id);
        // Notify other members that user left
        this.server
          .to(chatroomId)
          .emit('user_left', { userId, chatroomId, socketId: client.id });
      }
    });
  }

  // Authenticate and register user
  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: { user_id: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { user_id } = data;

    // Track this socket for this user
    if (!this.userSockets.has(user_id)) {
      this.userSockets.set(user_id, []);
    }
    this.userSockets.get(user_id)?.push(client.id);
    this.socketUsers.set(client.id, user_id);

    client.emit('registered', { user_id, socket_id: client.id });
    console.log(`User ${user_id} registered with socket ${client.id}`);
  }

  // Join a chatroom
  @SubscribeMessage('join_chatroom')
  async handleJoinChatroom(
    @MessageBody() data: { chatroom_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { chatroom_id } = data;
    const userId = this.socketUsers.get(client.id);

    if (!userId) {
      client.emit('error', { message: 'User not registered' });
      return;
    }

    try {
      // Verify chatroom exists and user is a member
      const chatroom = await this.messagesService.findChatroom(chatroom_id);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
      const memberUserIds = chatroom.members.map((m: any) => m.user_id);
      if (!memberUserIds.includes(userId.toString())) {
        client.emit('error', {
          message: 'You are not a member of this chatroom',
        });
        return;
      }

      // Join the Socket.IO room
      void client.join(chatroom_id);

      // Track chatroom membership
      if (!this.chatroomMembers.has(chatroom_id)) {
        this.chatroomMembers.set(chatroom_id, new Set());
      }
      this.chatroomMembers.get(chatroom_id)?.add(client.id);

      // Notify user they joined
      client.emit('joined_chatroom', {
        chatroom_id,
        chatroom_name: chatroom.name,
      });

      // Notify other members
      client.to(chatroom_id).emit('user_joined', {
        chatroom_id,
        user_id: userId,
        socket_id: client.id,
      });

      console.log(`User ${userId} joined chatroom ${chatroom_id}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      client.emit('error', { message: errorMessage });
    }
  }

  // Leave a chatroom
  @SubscribeMessage('leave_chatroom')
  handleLeaveChatroom(
    @MessageBody() data: { chatroom_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { chatroom_id } = data;
    const userId = this.socketUsers.get(client.id);

    void client.leave(chatroom_id);

    // Remove from tracking
    this.chatroomMembers.get(chatroom_id)?.delete(client.id);

    // Notify user they left
    client.emit('left_chatroom', { chatroom_id });

    // Notify other members
    this.server.to(chatroom_id).emit('user_left', {
      chatroom_id,
      user_id: userId,
      socket_id: client.id,
    });

    console.log(`User ${userId} left chatroom ${chatroom_id}`);
  }

  // Send a chat message
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: CreateChatMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUsers.get(client.id);

    if (!userId) {
      client.emit('error', { message: 'User not registered' });
      return;
    }

    try {
      // Create the message (this also creates notifications)
      const message = await this.messagesService.createChatMessage(data);

      // Broadcast to all members in the chatroom
      this.server.to(data.chatroom_id).emit('new_message', message);

      // Send notification events to offline or non-chatroom users
      const chatroom = await this.messagesService.findChatroom(
        data.chatroom_id,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
      const memberUserIds = chatroom.members.map((m: any) => m.user_id);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      memberUserIds.forEach((memberId: string) => {
        if (memberId !== data.sender_id.toString()) {
          // Check if user is online
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const memberSockets = this.userSockets.get(parseInt(memberId));
          if (memberSockets && memberSockets.length > 0) {
            // Send notification to all user's connected sockets
            memberSockets.forEach((socketId) => {
              this.server.to(socketId).emit('new_notification', {
                type: 'chat',
                chatroom_id: data.chatroom_id,
                chatroom_name: chatroom.name,
                message_id: message.id,
                sender_id: data.sender_id,
              });
            });
          }
        }
      });

      console.log(
        `Message sent in chatroom ${data.chatroom_id} by user ${userId}`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      client.emit('error', { message: errorMessage });
    }
  }

  // Mark message as read
  @SubscribeMessage('mark_message_read')
  handleMarkMessageRead(
    @MessageBody() data: { message_id: string; chatroom_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUsers.get(client.id);

    if (!userId) {
      client.emit('error', { message: 'User not registered' });
      return;
    }

    try {
      this.messagesService.markChatMessageAsRead(data.message_id);

      // Notify the chatroom that message was read
      this.server.to(data.chatroom_id).emit('message_read', {
        message_id: data.message_id,
        read_by: userId,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      client.emit('error', { message: errorMessage });
    }
  }

  // Typing indicator
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { chatroom_id: string; is_typing: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUsers.get(client.id);

    if (!userId) {
      return;
    }

    // Broadcast to others in the chatroom (not to self)
    client.to(data.chatroom_id).emit('user_typing', {
      chatroom_id: data.chatroom_id,
      user_id: userId,
      is_typing: data.is_typing,
    });
  }

  // Helper method to send notification to a specific user
  sendNotificationToUser(userId: number, notification: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit('new_notification', notification);
      });
    }
  }

  // Helper method to broadcast to a chatroom
  broadcastToChatroom(chatroomId: string, event: string, data: any) {
    this.server.to(chatroomId).emit(event, data);
  }
}
