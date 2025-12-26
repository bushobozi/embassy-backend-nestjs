import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateChatroomDto,
  CreateChatMessageDto,
  CreateEmailDto,
  CreateNotificationDto,
  QueryEmailsDto,
} from './export-messages';
import { randomUUID } from 'crypto';

@Injectable()
export class MessagesService {
  // In-memory storage (replace with database in production)
  private chatrooms: Array<
    CreateChatroomDto & { id: string; created_at: Date; updated_at: Date }
  > = [];

  private chatMessages: Array<
    CreateChatMessageDto & {
      id: string;
      is_read: boolean;
      created_at: Date;
      updated_at: Date;
    }
  > = [];

  private emails: Array<
    CreateEmailDto & {
      id: string;
      is_read: boolean;
      read_at?: Date;
      sent_at?: Date;
      created_at: Date;
      updated_at: Date;
    }
  > = [];

  private notifications: Array<
    CreateNotificationDto & { id: string; created_at: Date }
  > = [];

  // ==================== CHATROOMS ====================

  createChatroom(createChatroomDto: CreateChatroomDto) {
    const newChatroom = {
      id: randomUUID(),
      ...createChatroomDto,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.chatrooms.push(newChatroom);
    return newChatroom;
  }

  findAllChatrooms(embassy_id?: number, user_id?: number) {
    let filtered = this.chatrooms;

    if (embassy_id !== undefined) {
      filtered = filtered.filter((room) => room.embassy_id === embassy_id);
    }

    if (user_id !== undefined) {
      filtered = filtered.filter((room) => room.member_ids.includes(user_id));
    }

    return filtered;
  }

  findChatroom(id: string) {
    const chatroom = this.chatrooms.find((room) => room.id === id);
    if (!chatroom) {
      throw new NotFoundException(`Chatroom with ID ${id} not found`);
    }
    return chatroom;
  }

  addMemberToChatroom(chatroomId: string, userId: number) {
    const chatroom = this.findChatroom(chatroomId);
    if (!chatroom.member_ids.includes(userId)) {
      chatroom.member_ids.push(userId);
      chatroom.updated_at = new Date();
    }
    return chatroom;
  }

  removeMemberFromChatroom(chatroomId: string, userId: number) {
    const chatroom = this.findChatroom(chatroomId);
    chatroom.member_ids = chatroom.member_ids.filter((id) => id !== userId);
    chatroom.updated_at = new Date();
    return chatroom;
  }

  // ==================== CHAT MESSAGES ====================

  createChatMessage(createChatMessageDto: CreateChatMessageDto) {
    // Verify chatroom exists
    this.findChatroom(createChatMessageDto.chatroom_id);

    const newMessage = {
      id: randomUUID(),
      ...createChatMessageDto,
      is_read: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.chatMessages.push(newMessage);

    // Create notifications for chatroom members
    const chatroom = this.findChatroom(createChatMessageDto.chatroom_id);
    chatroom.member_ids.forEach((memberId) => {
      if (memberId !== createChatMessageDto.sender_id) {
        this.createNotification({
          user_id: memberId,
          title: 'New chat message',
          message: `New message in ${chatroom.name}`,
          type: 'chat',
          link: `/chatrooms/${chatroom.id}`,
          is_read: false,
        });
      }
    });

    return newMessage;
  }

  findChatMessages(chatroomId: string) {
    return this.chatMessages
      .filter((msg) => msg.chatroom_id === chatroomId)
      .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
  }

  markChatMessageAsRead(messageId: string) {
    const message = this.chatMessages.find((msg) => msg.id === messageId);
    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }
    message.is_read = true;
    message.updated_at = new Date();
    return message;
  }

  deleteChatMessage(messageId: string) {
    const messageIndex = this.chatMessages.findIndex(
      (msg) => msg.id === messageId,
    );
    if (messageIndex === -1) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }
    const deletedMessage = this.chatMessages[messageIndex];
    this.chatMessages.splice(messageIndex, 1);
    return deletedMessage;
  }

  // ==================== EMAILS ====================

  createEmail(createEmailDto: CreateEmailDto) {
    const newEmail = {
      id: randomUUID(),
      ...createEmailDto,
      is_read: false,
      created_at: new Date(),
      updated_at: new Date(),
      sent_at: createEmailDto.status === 'sent' ? new Date() : undefined,
    };
    this.emails.push(newEmail);

    // Create notifications for recipients if email is sent
    if (createEmailDto.status === 'sent') {
      createEmailDto.receiver_ids.forEach((receiverId) => {
        this.createNotification({
          user_id: receiverId,
          title: 'New email received',
          message: `Subject: ${createEmailDto.subject}`,
          type: 'email',
          link: `/emails/${newEmail.id}`,
          is_read: false,
        });
      });
    }

    return newEmail;
  }

  findAllEmails(queryParams?: QueryEmailsDto) {
    let filtered = this.emails;

    if (queryParams) {
      if (queryParams.embassy_id !== undefined) {
        filtered = filtered.filter(
          (email) => email.embassy_id === queryParams.embassy_id,
        );
      }

      if (queryParams.sender_id !== undefined) {
        filtered = filtered.filter(
          (email) => email.sender_id === queryParams.sender_id,
        );
      }

      if (queryParams.receiver_id !== undefined) {
        filtered = filtered.filter((email) =>
          email.receiver_ids.includes(queryParams.receiver_id!),
        );
      }

      if (queryParams.status !== undefined) {
        filtered = filtered.filter(
          (email) => email.status === queryParams.status,
        );
      }
    }

    const page = Number(queryParams?.page) || 1;
    const limit = Number(queryParams?.limit) || 25;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const paginatedEmails = filtered.slice(skip, skip + limit);

    return {
      data: paginatedEmails,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  findEmail(id: string) {
    const email = this.emails.find((email) => email.id === id);
    if (!email) {
      throw new NotFoundException(`Email with ID ${id} not found`);
    }
    return email;
  }

  updateEmailStatus(id: string, status: string) {
    const email = this.findEmail(id);
    email.status = status;
    email.updated_at = new Date();

    if (status === 'read' && !email.is_read) {
      email.is_read = true;
      email.read_at = new Date();
    }

    if (status === 'sent' && !email.sent_at) {
      email.sent_at = new Date();
    }

    return email;
  }

  markEmailAsRead(id: string) {
    return this.updateEmailStatus(id, 'read');
  }

  markEmailAsDraft(id: string) {
    return this.updateEmailStatus(id, 'draft');
  }

  archiveEmail(id: string) {
    return this.updateEmailStatus(id, 'archived');
  }

  deleteEmail(id: string) {
    return this.updateEmailStatus(id, 'deleted');
  }

  scheduleEmail(id: string, scheduledAt: Date) {
    const email = this.findEmail(id);
    email.scheduled_at = scheduledAt;
    email.status = 'scheduled';
    email.updated_at = new Date();
    return email;
  }

  // Get emails by type
  getInbox(userId: number, embassy_id?: number) {
    return this.findAllEmails({
      receiver_id: userId,
      embassy_id,
      status: 'sent',
    });
  }

  getSentEmails(userId: number, embassy_id?: number) {
    return this.findAllEmails({
      sender_id: userId,
      embassy_id,
      status: 'sent',
    });
  }

  getDrafts(userId: number, embassy_id?: number) {
    return this.findAllEmails({
      sender_id: userId,
      embassy_id,
      status: 'draft',
    });
  }

  getArchivedEmails(userId: number, embassy_id?: number) {
    return this.findAllEmails({
      receiver_id: userId,
      embassy_id,
      status: 'archived',
    });
  }

  // ==================== NOTIFICATIONS ====================

  createNotification(createNotificationDto: CreateNotificationDto) {
    const newNotification = {
      id: randomUUID(),
      ...createNotificationDto,
      created_at: new Date(),
    };
    this.notifications.push(newNotification);
    return newNotification;
  }

  findUserNotifications(userId: number, unreadOnly = false) {
    let filtered = this.notifications.filter(
      (notif) => notif.user_id === userId,
    );

    if (unreadOnly) {
      filtered = filtered.filter((notif) => !notif.is_read);
    }

    return filtered.sort(
      (a, b) => b.created_at.getTime() - a.created_at.getTime(),
    );
  }

  markNotificationAsRead(id: string) {
    const notification = this.notifications.find((notif) => notif.id === id);
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    notification.is_read = true;
    return notification;
  }

  markAllNotificationsAsRead(userId: number) {
    const userNotifications = this.notifications.filter(
      (notif) => notif.user_id === userId,
    );
    userNotifications.forEach((notif) => {
      notif.is_read = true;
    });
    return { updated: userNotifications.length };
  }

  deleteNotification(id: string) {
    const notificationIndex = this.notifications.findIndex(
      (notif) => notif.id === id,
    );
    if (notificationIndex === -1) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    const deletedNotification = this.notifications[notificationIndex];
    this.notifications.splice(notificationIndex, 1);
    return deletedNotification;
  }

  // ==================== STATISTICS ====================

  getMessagingStats(userId: number, embassy_id?: number) {
    let emails = this.emails;
    let chatrooms = this.chatrooms;
    const notifications = this.notifications.filter(
      (notif) => notif.user_id === userId,
    );

    if (embassy_id !== undefined) {
      emails = emails.filter((email) => email.embassy_id === embassy_id);
      chatrooms = chatrooms.filter((room) => room.embassy_id === embassy_id);
    }

    const receivedEmails = emails.filter((email) =>
      email.receiver_ids.includes(userId),
    );
    const sentEmails = emails.filter((email) => email.sender_id === userId);

    return {
      emails: {
        total: receivedEmails.length + sentEmails.length,
        received: receivedEmails.length,
        sent: sentEmails.length,
        unread: receivedEmails.filter((e) => !e.is_read).length,
        drafts: emails.filter(
          (e) => e.sender_id === userId && e.status === 'draft',
        ).length,
        archived: receivedEmails.filter((e) => e.status === 'archived').length,
      },
      chatrooms: {
        total: chatrooms.filter((room) => room.member_ids.includes(userId))
          .length,
      },
      notifications: {
        total: notifications.length,
        unread: notifications.filter((n) => !n.is_read).length,
      },
    };
  }
}
