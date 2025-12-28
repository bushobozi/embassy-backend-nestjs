import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateEventDto,
  UpdateEventDto,
  QueryEventsDto,
} from './export-events';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(queryParams?: QueryEventsDto) {
    // Build the where clause based on query parameters
    const where: any = {};

    if (queryParams) {
      if (queryParams.embassy_id !== undefined) {
        where.embassy_id = queryParams.embassy_id.toString();
      }

      if (queryParams.is_active !== undefined) {
        where.is_active = queryParams.is_active;
      }

      if (queryParams.is_virtual !== undefined) {
        where.is_virtual = queryParams.is_virtual;
      }

      if (queryParams.is_paid !== undefined) {
        where.is_paid = queryParams.is_paid;
      }

      if (queryParams.is_public !== undefined) {
        where.is_public = queryParams.is_public;
      }

      if (queryParams.event_type !== undefined) {
        where.event_type = queryParams.event_type;
      }
    }

    const page = Number(queryParams?.page) || 1;
    const limit = Number(queryParams?.limit) || 25;
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
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
          event_date: true,
          location: true,
          is_active: true,
          is_virtual: true,
          is_paid: true,
          is_public: true,
          event_type: true,
          created_by: true,
          created_at: true,
          updated_at: true,
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        embassy_id: true,
        title: true,
        description: true,
        event_date: true,
        location: true,
        is_active: true,
        is_virtual: true,
        is_paid: true,
        is_public: true,
        event_type: true,
        created_by: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async create(createEventDto: CreateEventDto, created_by: string) {
    // Map DTO fields to schema fields
    const event = await this.prisma.event.create({
      data: {
        embassy_id: createEventDto.embassy_id.toString(),
        title: createEventDto.event_name,
        description: createEventDto.event_description,
        event_date: createEventDto.event_start_date,
        location: createEventDto.event_location,
        is_active: createEventDto.is_active,
        is_virtual: createEventDto.is_virtual,
        is_paid: createEventDto.is_paid,
        is_public: createEventDto.is_public,
        event_type: createEventDto.event_type,
        created_by,
      },
      select: {
        id: true,
        embassy_id: true,
        title: true,
        description: true,
        event_date: true,
        location: true,
        is_active: true,
        is_virtual: true,
        is_paid: true,
        is_public: true,
        event_type: true,
        created_by: true,
        created_at: true,
        updated_at: true,
      },
    });

    return event;
  }

  async update(id: string, updateEventDto: Partial<UpdateEventDto>) {
    // Check if event exists
    await this.findOne(id);

    // Map DTO fields to schema fields if they exist
    const dataToUpdate: any = {};

    if (updateEventDto.event_name !== undefined) {
      dataToUpdate.title = updateEventDto.event_name;
    }
    if (updateEventDto.event_description !== undefined) {
      dataToUpdate.description = updateEventDto.event_description;
    }
    if (updateEventDto.event_start_date !== undefined) {
      dataToUpdate.event_date = updateEventDto.event_start_date;
    }
    if (updateEventDto.event_location !== undefined) {
      dataToUpdate.location = updateEventDto.event_location;
    }
    if (updateEventDto.is_active !== undefined) {
      dataToUpdate.is_active = updateEventDto.is_active;
    }
    if (updateEventDto.is_virtual !== undefined) {
      dataToUpdate.is_virtual = updateEventDto.is_virtual;
    }
    if (updateEventDto.is_paid !== undefined) {
      dataToUpdate.is_paid = updateEventDto.is_paid;
    }
    if (updateEventDto.is_public !== undefined) {
      dataToUpdate.is_public = updateEventDto.is_public;
    }
    if (updateEventDto.event_type !== undefined) {
      dataToUpdate.event_type = updateEventDto.event_type;
    }
    if (updateEventDto.embassy_id !== undefined) {
      dataToUpdate.embassy_id = updateEventDto.embassy_id.toString();
    }

    const event = await this.prisma.event.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        embassy_id: true,
        title: true,
        description: true,
        event_date: true,
        location: true,
        is_active: true,
        is_virtual: true,
        is_paid: true,
        is_public: true,
        event_type: true,
        created_by: true,
        created_at: true,
        updated_at: true,
      },
    });

    return event;
  }

  async remove(id: string) {
    // Check if event exists
    await this.findOne(id);

    return this.prisma.event.delete({
      where: { id },
      select: {
        id: true,
        embassy_id: true,
        title: true,
        description: true,
        event_date: true,
        location: true,
      },
    });
  }

  async deactivate(id: string) {
    return this.update(id, { is_active: false });
  }

  async activate(id: string) {
    return this.update(id, { is_active: true });
  }

  async getStats(embassy_id?: number) {
    const where: any = {};

    if (embassy_id !== undefined) {
      where.embassy_id = embassy_id.toString();
    }

    const [total, active, virtual, paid, publicEvents] = await Promise.all([
      this.prisma.event.count({ where }),
      this.prisma.event.count({ where: { ...where, is_active: true } }),
      this.prisma.event.count({ where: { ...where, is_virtual: true } }),
      this.prisma.event.count({ where: { ...where, is_paid: true } }),
      this.prisma.event.count({ where: { ...where, is_public: true } }),
    ]);

    const inactive = total - active;
    const inPerson = total - virtual;
    const free = total - paid;
    const privateEvents = total - publicEvents;

    return {
      total,
      active,
      inactive,
      virtual,
      inPerson,
      paid,
      free,
      public: publicEvents,
      private: privateEvents,
    };
  }
}
