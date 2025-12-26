import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateEventDto,
  UpdateEventDto,
  QueryEventsDto,
} from './export-events';
import { randomUUID } from 'crypto';

@Injectable()
export class EventsService {
  private events: Array<
    CreateEventDto & { id: string; created_at: Date; updated_at: Date }
  > = [
    {
      id: randomUUID(),
      event_name: 'Sample Event',
      event_description: 'This is a sample event description.',
      event_start_date: new Date('2024-10-01T10:00:00Z'),
      event_end_date: new Date('2024-10-01T12:00:00Z'),
      event_location: '123 Sample St, Sample City',
      event_type: 'seminar',
      is_virtual: false,
      is_active: true,
      is_public: true,
      is_private: false,
      is_paid: false,
      event_cost: 0,
      max_attendees: 50,
      registration_deadline: new Date('2024-09-25T23:59:59Z'),
      embassy_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
  findAll(queryParams?: QueryEventsDto) {
    let filteredEvents = this.events;

    if (queryParams) {
      if (queryParams.embassy_id !== undefined) {
        filteredEvents = filteredEvents.filter(
          (event) => event.embassy_id === queryParams.embassy_id,
        );
      }

      if (queryParams.is_active !== undefined) {
        filteredEvents = filteredEvents.filter(
          (event) => event.is_active === queryParams.is_active,
        );
      }

      if (queryParams.is_virtual !== undefined) {
        filteredEvents = filteredEvents.filter(
          (event) => event.is_virtual === queryParams.is_virtual,
        );
      }

      if (queryParams.is_paid !== undefined) {
        filteredEvents = filteredEvents.filter(
          (event) => event.is_paid === queryParams.is_paid,
        );
      }

      if (queryParams.is_public !== undefined) {
        filteredEvents = filteredEvents.filter(
          (event) => event.is_public === queryParams.is_public,
        );
      }

      if (queryParams.event_type !== undefined) {
        filteredEvents = filteredEvents.filter(
          (event) => event.event_type === queryParams.event_type,
        );
      }
    }

    const page = Number(queryParams?.page) || 1;
    const limit = Number(queryParams?.limit) || 25;
    const total = filteredEvents.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const paginatedEvents = filteredEvents.slice(skip, skip + limit);

    return {
      data: paginatedEvents,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
  findOne(id: string) {
    const event = this.events.find((event) => event.id === id);
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }
  create(createEventDto: CreateEventDto) {
    const newEvent = {
      id: randomUUID(),
      ...createEventDto,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.events.push(newEvent);
    return newEvent;
  }
  update(id: string, updateEventDto: Partial<UpdateEventDto>) {
    const eventIndex = this.events.findIndex((event) => event.id === id);
    if (eventIndex === -1) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const updatedEvent = {
      ...this.events[eventIndex],
      ...updateEventDto,
      updated_at: new Date(),
    };

    this.events[eventIndex] = updatedEvent;
    return updatedEvent;
  }
  remove(id: string) {
    const eventIndex = this.events.findIndex((event) => event.id === id);
    if (eventIndex === -1) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    const deletedEvent = this.events[eventIndex];
    this.events.splice(eventIndex, 1);
    return deletedEvent;
  }
  deactivate(id: string) {
    return this.update(id, { is_active: false });
  }
  activate(id: string) {
    return this.update(id, { is_active: true });
  }
  getStats(embassy_id?: number) {
    let events = this.events;

    if (embassy_id !== undefined) {
      events = events.filter((event) => event.embassy_id === embassy_id);
    }

    const total = events.length;
    const active = events.filter((event) => event.is_active).length;
    const inactive = total - active;
    const virtual = events.filter((event) => event.is_virtual).length;
    const inPerson = total - virtual;
    const paid = events.filter((event) => event.is_paid).length;
    const free = total - paid;
    const publicEvents = events.filter((event) => event.is_public).length;
    const privateEvents = events.filter((event) => event.is_private).length;

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
