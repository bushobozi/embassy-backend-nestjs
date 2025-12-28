import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateChatroomDto,
  CreateChatMessageDto,
  CreateEmailDto,
  CreateNotificationDto,
  QueryEmailsDto,
} from './export-messages';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  // ==================== CHATROOMS ====================

  async createChatroom(createChatroomDto: CreateChatroomDto) {
    const { member_ids, created_by, embassy_id, ...chatroomData } =
      createChatroomDto;

    // Create chatroom with members
    const chatroom = await this.prisma.chatroom.create({
      data: {
        ...chatroomData,
        embassy_id: embassy_id.toString(),
        created_by: created_by.toString(),
        members: {
          create: member_ids.map((userId) => ({
            user_id: userId.toString(),
          })),
        },
      },
      include: {
        members: {
          select: {
            user_id: true,
          },
        },
      },
    });

    return chatroom;
  }

  async findAllChatrooms(embassy_id?: number, user_id?: number) {
    const where: any = {};

    if (embassy_id !== undefined) {
      where.embassy_id = embassy_id.toString();
    }

    if (user_id !== undefined) {
      where.members = {
        some: {
          user_id: user_id.toString(),
        },
      };
    }

    return this.prisma.chatroom.findMany({
      where,
      include: {
        members: {
          select: {
            user_id: true,
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    });
  }

  async findChatroom(id: string) {
    const chatroom = await this.prisma.chatroom.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            user_id: true,
          },
        },
      },
    });

    if (!chatroom) {
      throw new NotFoundException(`Chatroom with ID ${id} not found`);
    }
    return chatroom;
  }

  async addMemberToChatroom(chatroomId: string, userId: number) {
    // Check if chatroom exists
    await this.findChatroom(chatroomId);

    // Check if member already exists
    const existingMember = await this.prisma.chatroomMember.findUnique({
      where: {
        chatroom_id_user_id: {
          chatroom_id: chatroomId,
          user_id: userId.toString(),
        },
      },
    });

    if (!existingMember) {
      await this.prisma.chatroomMember.create({
        data: {
          chatroom_id: chatroomId,
          user_id: userId.toString(),
        },
      });
    }

    // Return updated chatroom
    return this.findChatroom(chatroomId);
  }

  async removeMemberFromChatroom(chatroomId: string, userId: number) {
    // Check if chatroom exists
    await this.findChatroom(chatroomId);

    // Delete the member
    await this.prisma.chatroomMember.deleteMany({
      where: {
        chatroom_id: chatroomId,
        user_id: userId.toString(),
      },
    });

    // Return updated chatroom
    return this.findChatroom(chatroomId);
  }

  // ==================== CHAT MESSAGES ====================

  async createChatMessage(createChatMessageDto: CreateChatMessageDto) {
    // Verify chatroom exists
    const chatroom = await this.findChatroom(
      createChatMessageDto.chatroom_id,
    );

    const newMessage = await this.prisma.chatMessage.create({
      data: {
        chatroom_id: createChatMessageDto.chatroom_id,
        sender_id: createChatMessageDto.sender_id.toString(),
        content: createChatMessageDto.content,
        attachments: createChatMessageDto.attachments || [],
      },
    });

    // Create notifications for chatroom members
    const memberIds = chatroom.members.map((m) => m.user_id);
    const notificationsToCreate = memberIds
      .filter((memberId) => memberId !== createChatMessageDto.sender_id.toString())
      .map((memberId) => ({
        user_id: memberId,
        title: 'New chat message',
        message: `New message in ${chatroom.name}`,
        type: 'chat',
        link: `/chatrooms/${chatroom.id}`,
        is_read: false,
      }));

    if (notificationsToCreate.length > 0) {
      await this.prisma.notification.createMany({
        data: notificationsToCreate,
      });
    }

    return newMessage;
  }

  async findChatMessages(chatroomId: string) {
    return this.prisma.chatMessage.findMany({
      where: { chatroom_id: chatroomId },
      orderBy: {
        created_at: 'asc',
      },
    });
  }

  async markChatMessageAsRead(messageId: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { is_read: true },
    });
  }

  async deleteChatMessage(messageId: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    return this.prisma.chatMessage.delete({
      where: { id: messageId },
    });
  }

  // ==================== EMAILS ====================

  async createEmail(createEmailDto: CreateEmailDto) {
    const { receiver_ids, sender_id, embassy_id, ...emailData } =
      createEmailDto;

    const newEmail = await this.prisma.email.create({
      data: {
        ...emailData,
        embassy_id: embassy_id.toString(),
        sender_id: sender_id.toString(),
        sent_at: createEmailDto.status === 'sent' ? new Date() : null,
        recipients: {
          create: receiver_ids.map((receiverId) => ({
            user_id: receiverId.toString(),
          })),
        },
      },
      include: {
        recipients: {
          select: {
            user_id: true,
            is_read: true,
            read_at: true,
          },
        },
      },
    });

    // Create notifications for recipients if email is sent
    if (createEmailDto.status === 'sent') {
      const notificationsToCreate = receiver_ids.map((receiverId) => ({
        user_id: receiverId.toString(),
        title: 'New email received',
        message: `Subject: ${createEmailDto.subject}`,
        type: 'email',
        link: `/emails/${newEmail.id}`,
        is_read: false,
      }));

      await this.prisma.notification.createMany({
        data: notificationsToCreate,
      });
    }

    return newEmail;
  }

  async findAllEmails(queryParams?: QueryEmailsDto) {
    const where: any = {};

    if (queryParams) {
      if (queryParams.embassy_id !== undefined) {
        where.embassy_id = queryParams.embassy_id.toString();
      }

      if (queryParams.sender_id !== undefined) {
        where.sender_id = queryParams.sender_id.toString();
      }

      if (queryParams.receiver_id !== undefined) {
        where.recipients = {
          some: {
            user_id: queryParams.receiver_id.toString(),
          },
        };
      }

      if (queryParams.status !== undefined) {
        where.status = queryParams.status;
      }
    }

    const page = Number(queryParams?.page) || 1;
    const limit = Number(queryParams?.limit) || 25;
    const skip = (page - 1) * limit;

    const [emails, total] = await Promise.all([
      this.prisma.email.findMany({
        where,
        skip,
        take: limit,
        include: {
          recipients: {
            select: {
              user_id: true,
              is_read: true,
              read_at: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.email.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: emails,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findEmail(id: string) {
    const email = await this.prisma.email.findUnique({
      where: { id },
      include: {
        recipients: {
          select: {
            user_id: true,
            is_read: true,
            read_at: true,
          },
        },
      },
    });

    if (!email) {
      throw new NotFoundException(`Email with ID ${id} not found`);
    }
    return email;
  }

  async updateEmailStatus(id: string, status: string) {
    // Check if email exists
    await this.findEmail(id);

    const updateData: any = {
      status,
    };

    if (status === 'sent' && !updateData.sent_at) {
      updateData.sent_at = new Date();
    }

    return this.prisma.email.update({
      where: { id },
      data: updateData,
      include: {
        recipients: {
          select: {
            user_id: true,
            is_read: true,
            read_at: true,
          },
        },
      },
    });
  }

  async markEmailAsRead(id: string, userId?: string) {
    const email = await this.findEmail(id);

    // Update the recipient's read status if userId is provided
    if (userId && email.recipients.length > 0) {
      await this.prisma.emailRecipient.updateMany({
        where: {
          email_id: id,
          user_id: userId,
        },
        data: {
          is_read: true,
          read_at: new Date(),
        },
      });
    }

    return this.updateEmailStatus(id, 'read');
  }

  async markEmailAsDraft(id: string) {
    return this.updateEmailStatus(id, 'draft');
  }

  async archiveEmail(id: string) {
    return this.updateEmailStatus(id, 'archived');
  }

  async deleteEmail(id: string) {
    return this.updateEmailStatus(id, 'deleted');
  }

  async scheduleEmail(id: string, scheduledAt: Date) {
    // Check if email exists
    await this.findEmail(id);

    return this.prisma.email.update({
      where: { id },
      data: {
        scheduled_at: scheduledAt,
        status: 'scheduled',
      },
      include: {
        recipients: {
          select: {
            user_id: true,
            is_read: true,
            read_at: true,
          },
        },
      },
    });
  }

  // Get emails by type
  async getInbox(userId: number, embassy_id?: number) {
    return this.findAllEmails({
      receiver_id: userId,
      embassy_id,
      status: 'sent',
    });
  }

  async getSentEmails(userId: number, embassy_id?: number) {
    return this.findAllEmails({
      sender_id: userId,
      embassy_id,
      status: 'sent',
    });
  }

  async getDrafts(userId: number, embassy_id?: number) {
    return this.findAllEmails({
      sender_id: userId,
      embassy_id,
      status: 'draft',
    });
  }

  async getArchivedEmails(userId: number, embassy_id?: number) {
    return this.findAllEmails({
      receiver_id: userId,
      embassy_id,
      status: 'archived',
    });
  }

  // ==================== NOTIFICATIONS ====================

  async createNotification(createNotificationDto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        user_id: createNotificationDto.user_id.toString(),
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        type: createNotificationDto.type,
        link: createNotificationDto.link,
        is_read: createNotificationDto.is_read,
      },
    });
  }

  async findUserNotifications(userId: number, unreadOnly = false) {
    const where: any = {
      user_id: userId.toString(),
    };

    if (unreadOnly) {
      where.is_read = false;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async markNotificationAsRead(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return this.prisma.notification.update({
      where: { id },
      data: { is_read: true },
    });
  }

  async markAllNotificationsAsRead(userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: {
        user_id: userId.toString(),
        is_read: false,
      },
      data: {
        is_read: true,
      },
    });

    return { updated: result.count };
  }

  async deleteNotification(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return this.prisma.notification.delete({
      where: { id },
    });
  }

  // ==================== STATISTICS ====================

  async getMessagingStats(userId: number, embassy_id?: number) {
    const userIdStr = userId.toString();
    const embassyIdStr = embassy_id?.toString();

    const emailWhere: any = embassyIdStr
      ? { embassy_id: embassyIdStr }
      : {};
    const chatroomWhere: any = embassyIdStr
      ? { embassy_id: embassyIdStr }
      : {};

    const [receivedEmails, sentEmails, userChatrooms, notifications] =
      await Promise.all([
        this.prisma.email.count({
          where: {
            ...emailWhere,
            recipients: {
              some: {
                user_id: userIdStr,
              },
            },
          },
        }),
        this.prisma.email.count({
          where: {
            ...emailWhere,
            sender_id: userIdStr,
          },
        }),
        this.prisma.chatroom.count({
          where: {
            ...chatroomWhere,
            members: {
              some: {
                user_id: userIdStr,
              },
            },
          },
        }),
        this.prisma.notification.findMany({
          where: {
            user_id: userIdStr,
          },
        }),
      ]);

    // Get unread emails count
    const unreadEmails = await this.prisma.emailRecipient.count({
      where: {
        user_id: userIdStr,
        is_read: false,
        email: emailWhere.embassy_id
          ? { embassy_id: emailWhere.embassy_id }
          : {},
      },
    });

    // Get drafts count
    const drafts = await this.prisma.email.count({
      where: {
        ...emailWhere,
        sender_id: userIdStr,
        status: 'draft',
      },
    });

    // Get archived emails count
    const archived = await this.prisma.email.count({
      where: {
        ...emailWhere,
        recipients: {
          some: {
            user_id: userIdStr,
          },
        },
        status: 'archived',
      },
    });

    return {
      emails: {
        total: receivedEmails + sentEmails,
        received: receivedEmails,
        sent: sentEmails,
        unread: unreadEmails,
        drafts,
        archived,
      },
      chatrooms: {
        total: userChatrooms,
      },
      notifications: {
        total: notifications.length,
        unread: notifications.filter((n) => !n.is_read).length,
      },
    };
  }
}
