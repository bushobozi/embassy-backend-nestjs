import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto, QueryTasksDto } from './export-tasks';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(queryParams?: QueryTasksDto) {
    const where: {
      embassy_id?: string;
      assigned_to?: string;
      created_by?: string;
      status?: string;
      priority?: string;
      is_urgent?: boolean;
    } = {};

    if (queryParams) {
      if (queryParams.embassy_id !== undefined) {
        where.embassy_id = queryParams.embassy_id.toString();
      }

      if (queryParams.assigned_to !== undefined) {
        where.assigned_to = queryParams.assigned_to.toString();
      }

      if (queryParams.created_by !== undefined) {
        where.created_by = queryParams.created_by.toString();
      }

      if (queryParams.status !== undefined) {
        where.status = queryParams.status;
      }

      if (queryParams.priority !== undefined) {
        where.priority = queryParams.priority;
      }

      if (queryParams.is_urgent !== undefined) {
        where.is_urgent = queryParams.is_urgent;
      }
    }

    const page = Number(queryParams?.page) || 1;
    const limit = Number(queryParams?.limit) || 25;
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
        select: {
          id: true,
          embassy_id: true,
          title: true,
          description: true,
          assigned_to: true,
          created_by: true,
          status: true,
          priority: true,
          is_urgent: true,
          due_date: true,
          completed_at: true,
          created_at: true,
          updated_at: true,
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        embassy_id: true,
        title: true,
        description: true,
        assigned_to: true,
        created_by: true,
        status: true,
        priority: true,
        is_urgent: true,
        due_date: true,
        completed_at: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async create(createTaskDto: CreateTaskDto, created_by: string) {
    const task = await this.prisma.task.create({
      data: {
        embassy_id: createTaskDto.embassy_id.toString(),
        title: createTaskDto.title,
        description: createTaskDto.description,
        assigned_to: createTaskDto.assigned_to.toString(),
        created_by,
        status: createTaskDto.status || 'pending',
        priority: createTaskDto.priority || 'medium',
        is_urgent: createTaskDto.is_urgent || false,
        due_date: createTaskDto.due_date,
      },
      select: {
        id: true,
        embassy_id: true,
        title: true,
        description: true,
        assigned_to: true,
        created_by: true,
        status: true,
        priority: true,
        is_urgent: true,
        due_date: true,
        completed_at: true,
        created_at: true,
        updated_at: true,
      },
    });

    return task;
  }

  async update(id: string, updateTaskDto: Partial<UpdateTaskDto>) {
    // Check if task exists
    await this.findOne(id);

    const dataToUpdate: Omit<
      Partial<UpdateTaskDto>,
      'embassy_id' | 'assigned_to' | 'created_by'
    > & {
      embassy_id?: string;
      assigned_to?: string;
      created_by?: string;
      completed_at?: Date;
    } = {
      title: updateTaskDto.title,
      description: updateTaskDto.description,
      due_date: updateTaskDto.due_date,
      status: updateTaskDto.status,
      priority: updateTaskDto.priority,
      is_urgent: updateTaskDto.is_urgent,
    };

    if (updateTaskDto.embassy_id !== undefined) {
      dataToUpdate.embassy_id = updateTaskDto.embassy_id.toString();
    }

    if (updateTaskDto.assigned_to !== undefined) {
      dataToUpdate.assigned_to = updateTaskDto.assigned_to.toString();
    }

    if (updateTaskDto.created_by !== undefined) {
      dataToUpdate.created_by = updateTaskDto.created_by.toString();
    }

    // Set completed_at if status changes to completed
    if (updateTaskDto.status === 'completed' && !dataToUpdate.completed_at) {
      dataToUpdate.completed_at = new Date();
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        embassy_id: true,
        title: true,
        description: true,
        assigned_to: true,
        created_by: true,
        status: true,
        priority: true,
        is_urgent: true,
        due_date: true,
        completed_at: true,
        created_at: true,
        updated_at: true,
      },
    });

    return task;
  }

  async remove(id: string) {
    // Check if task exists
    await this.findOne(id);

    return this.prisma.task.delete({
      where: { id },
      select: {
        id: true,
        embassy_id: true,
        title: true,
        description: true,
        status: true,
      },
    });
  }

  // Status management
  async markAsPending(id: string) {
    return this.update(id, { status: 'pending' });
  }

  async markAsInProgress(id: string) {
    return this.update(id, { status: 'in_progress' });
  }

  async markAsCompleted(id: string) {
    return this.update(id, { status: 'completed' });
  }

  // Priority management
  async setLowPriority(id: string) {
    return this.update(id, { priority: 'low' });
  }

  async setMediumPriority(id: string) {
    return this.update(id, { priority: 'medium' });
  }

  async setHighPriority(id: string) {
    return this.update(id, { priority: 'high' });
  }

  // Urgent flag
  async markAsUrgent(id: string) {
    return this.update(id, { is_urgent: true });
  }

  async unmarkAsUrgent(id: string) {
    return this.update(id, { is_urgent: false });
  }

  // Statistics
  async getStats(embassy_id?: number, assigned_to?: number) {
    const where: {
      embassy_id?: string;
      assigned_to?: string;
    } = {};

    if (embassy_id !== undefined) {
      where.embassy_id = embassy_id.toString();
    }

    if (assigned_to !== undefined) {
      where.assigned_to = assigned_to.toString();
    }

    const [total, pending, inProgress, completed, low, medium, high, urgent] =
      await Promise.all([
        this.prisma.task.count({ where }),
        this.prisma.task.count({ where: { ...where, status: 'pending' } }),
        this.prisma.task.count({ where: { ...where, status: 'in_progress' } }),
        this.prisma.task.count({ where: { ...where, status: 'completed' } }),
        this.prisma.task.count({ where: { ...where, priority: 'low' } }),
        this.prisma.task.count({ where: { ...where, priority: 'medium' } }),
        this.prisma.task.count({ where: { ...where, priority: 'high' } }),
        this.prisma.task.count({ where: { ...where, is_urgent: true } }),
      ]);

    // Count overdue tasks
    const overdue = await this.prisma.task.count({
      where: {
        ...where,
        due_date: {
          lt: new Date(),
        },
        status: {
          not: 'completed',
        },
      },
    });

    return {
      total,
      byStatus: {
        pending,
        inProgress,
        completed,
      },
      byPriority: {
        low,
        medium,
        high,
      },
      urgent,
      overdue,
    };
  }
}
