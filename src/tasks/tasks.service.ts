import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto, QueryTasksDto } from './export-tasks';
import { randomUUID } from 'crypto';

@Injectable()
export class TasksService {
  private tasks: Array<
    CreateTaskDto & { id: string; created_at: Date; updated_at: Date }
  > = [
    {
      id: randomUUID(),
      title: 'Prepare quarterly report',
      description:
        'Compile and analyze data for the quarterly performance report.',
      due_date: new Date('2024-07-15T17:00:00Z'),
      status: 'in_progress',
      priority: 'high',
      is_urgent: true,
      assigned_to: 3,
      created_by: 1,
      embassy_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: randomUUID(),
      title: 'Update website content',
      description: 'Review and update embassy website content for accuracy.',
      due_date: new Date('2024-07-20T17:00:00Z'),
      status: 'pending',
      priority: 'medium',
      is_urgent: false,
      assigned_to: 2,
      created_by: 1,
      embassy_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  findAll(queryParams?: QueryTasksDto) {
    let filtered = this.tasks;

    if (queryParams) {
      if (queryParams.embassy_id !== undefined) {
        filtered = filtered.filter(
          (task) => task.embassy_id === queryParams.embassy_id,
        );
      }

      if (queryParams.assigned_to !== undefined) {
        filtered = filtered.filter(
          (task) => task.assigned_to === queryParams.assigned_to,
        );
      }

      if (queryParams.created_by !== undefined) {
        filtered = filtered.filter(
          (task) => task.created_by === queryParams.created_by,
        );
      }

      if (queryParams.status !== undefined) {
        filtered = filtered.filter(
          (task) => task.status === queryParams.status,
        );
      }

      if (queryParams.priority !== undefined) {
        filtered = filtered.filter(
          (task) => task.priority === queryParams.priority,
        );
      }

      if (queryParams.is_urgent !== undefined) {
        filtered = filtered.filter(
          (task) => task.is_urgent === queryParams.is_urgent,
        );
      }
    }

    const page = Number(queryParams?.page) || 1;
    const limit = Number(queryParams?.limit) || 25;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const paginatedTasks = filtered.slice(skip, skip + limit);

    return {
      data: paginatedTasks,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  findOne(id: string) {
    const task = this.tasks.find((task) => task.id === id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  create(createTaskDto: CreateTaskDto) {
    const newTask = {
      id: randomUUID(),
      ...createTaskDto,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.tasks.push(newTask);
    return newTask;
  }

  update(id: string, updateTaskDto: Partial<UpdateTaskDto>) {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const updatedTask = {
      ...this.tasks[taskIndex],
      ...updateTaskDto,
      updated_at: new Date(),
    };

    this.tasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  remove(id: string) {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    const deletedTask = this.tasks[taskIndex];
    this.tasks.splice(taskIndex, 1);
    return deletedTask;
  }

  // Status management
  markAsPending(id: string) {
    return this.update(id, { status: 'pending' });
  }

  markAsInProgress(id: string) {
    return this.update(id, { status: 'in_progress' });
  }

  markAsCompleted(id: string) {
    return this.update(id, { status: 'completed' });
  }

  // Priority management
  setLowPriority(id: string) {
    return this.update(id, { priority: 'low' });
  }

  setMediumPriority(id: string) {
    return this.update(id, { priority: 'medium' });
  }

  setHighPriority(id: string) {
    return this.update(id, { priority: 'high' });
  }

  // Urgent flag
  markAsUrgent(id: string) {
    return this.update(id, { is_urgent: true });
  }

  unmarkAsUrgent(id: string) {
    return this.update(id, { is_urgent: false });
  }

  // Statistics
  getStats(embassy_id?: number, assigned_to?: number) {
    let tasks = this.tasks;

    if (embassy_id !== undefined) {
      tasks = tasks.filter((task) => task.embassy_id === embassy_id);
    }

    if (assigned_to !== undefined) {
      tasks = tasks.filter((task) => task.assigned_to === assigned_to);
    }

    const total = tasks.length;
    const pending = tasks.filter((task) => task.status === 'pending').length;
    const inProgress = tasks.filter(
      (task) => task.status === 'in_progress',
    ).length;
    const completed = tasks.filter(
      (task) => task.status === 'completed',
    ).length;

    const low = tasks.filter((task) => task.priority === 'low').length;
    const medium = tasks.filter((task) => task.priority === 'medium').length;
    const high = tasks.filter((task) => task.priority === 'high').length;

    const urgent = tasks.filter((task) => task.is_urgent).length;

    const overdue = tasks.filter(
      (task) =>
        new Date(task.due_date) < new Date() && task.status !== 'completed',
    ).length;

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
