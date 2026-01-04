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
    const where: {
      embassy_id?: string;
      is_active?: boolean;
      is_virtual?: boolean;
      is_paid?: boolean;
      is_public?: boolean;
      event_type?: string;
    } = {};

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
          event_name: true,
          event_description: true,
          event_start_date: true,
          event_end_date: true,
          event_image: true,
          event_location: true,
          is_active: true,
          is_virtual: true,
          is_paid: true,
          is_public: true,
          is_private: true,
          event_type: true,
          event_cost: true,
          max_attendees: true,
          registration_deadline: true,
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
        event_name: true,
        event_description: true,
        event_start_date: true,
        event_end_date: true,
        event_image: true,
        event_location: true,
        is_active: true,
        is_virtual: true,
        is_paid: true,
        is_public: true,
        is_private: true,
        event_type: true,
        event_cost: true,
        max_attendees: true,
        registration_deadline: true,
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
        event_name: createEventDto.event_name,
        event_description: createEventDto.event_description,
        event_start_date: createEventDto.event_start_date,
        event_end_date: createEventDto.event_end_date,
        event_image: createEventDto.event_image,
        event_location: createEventDto.event_location,
        is_active: createEventDto.is_active,
        is_virtual: createEventDto.is_virtual,
        is_paid: createEventDto.is_paid,
        is_public: createEventDto.is_public,
        is_private: createEventDto.is_private,
        event_type: createEventDto.event_type,
        event_cost: createEventDto.event_cost,
        max_attendees: createEventDto.max_attendees,
        registration_deadline: createEventDto.registration_deadline,
        created_by,
      },
      select: {
        id: true,
        embassy_id: true,
        event_name: true,
        event_description: true,
        event_start_date: true,
        event_end_date: true,
        event_image: true,
        event_location: true,
        is_active: true,
        is_virtual: true,
        is_paid: true,
        is_public: true,
        is_private: true,
        event_type: true,
        created_by: true,
        created_at: true,
        updated_at: true,
        event_cost: true,
        max_attendees: true,
        registration_deadline: true,
      },
    });

    return event;
  }

  async update(id: string, updateEventDto: Partial<UpdateEventDto>) {
    // Check if event exists
    await this.findOne(id);

    // Map DTO fields to schema fields if they exist
    const dataToUpdate: {
      event_name?: string;
      event_description?: string;
      event_start_date?: Date;
      event_location?: string;
      is_active?: boolean;
      is_virtual?: boolean;
      is_paid?: boolean;
      is_public?: boolean;
      is_private?: boolean;
      event_type?: string;
      embassy_id?: string;
      event_end_date?: Date;
      event_image?: string;
      event_cost?: number;
      max_attendees?: number;
      registration_deadline?: Date;
    } = {};

    if (updateEventDto.event_name !== undefined) {
      dataToUpdate.event_name = updateEventDto.event_name;
    }
    if (updateEventDto.event_description !== undefined) {
      dataToUpdate.event_description = updateEventDto.event_description;
    }
    if (updateEventDto.event_start_date !== undefined) {
      dataToUpdate.event_start_date = updateEventDto.event_start_date;
    }
    if (updateEventDto.event_location !== undefined) {
      dataToUpdate.event_location = updateEventDto.event_location;
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
    if (updateEventDto.is_private !== undefined) {
      dataToUpdate.is_private = updateEventDto.is_private;
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
        event_name: true,
        event_description: true,
        event_start_date: true,
        event_end_date: true,
        event_image: true,
        event_location: true,
        is_active: true,
        is_virtual: true,
        is_paid: true,
        is_public: true,
        is_private: true,
        event_type: true,
        created_by: true,
        created_at: true,
        updated_at: true,
        event_cost: true,
        max_attendees: true,
        registration_deadline: true,
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
        event_name: true,
        event_description: true,
        event_start_date: true,
        event_end_date: true,
        event_image: true,
        event_location: true,
        is_active: true,
        is_virtual: true,
        is_paid: true,
        is_public: true,
        is_private: true,
        event_type: true,
        created_by: true,
        created_at: true,
        updated_at: true,
        event_cost: true,
        max_attendees: true,
        registration_deadline: true,
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
    const where: { embassy_id?: string } = {};

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
