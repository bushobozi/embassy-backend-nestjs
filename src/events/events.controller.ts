import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import {
  CreateEventDto,
  UpdateEventDto,
  QueryEventsDto,
} from './export-events';

@ApiTags('Events')
@ApiBearerAuth('JWT-auth')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}
  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({
    status: 201,
    description: 'The event has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of all events matching the filter criteria.',
  })
  getAll(@Query() queryParams: QueryEventsDto) {
    return this.eventsService.findAll(queryParams);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an event by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the event' })
  @ApiResponse({
    status: 200,
    description: 'The event details.',
  })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  getOne(@Param('id', ParseIntPipe) id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the event' })
  @ApiResponse({
    status: 200,
    description: 'The event has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateEventDto: Partial<UpdateEventDto>,
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an event by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the event' })
  @ApiResponse({
    status: 204,
    description: 'The event has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.eventsService.remove(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate an event by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the event' })
  @ApiResponse({
    status: 200,
    description: 'The event has been successfully deactivated.',
  })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  deactivate(@Param('id', ParseIntPipe) id: string) {
    return this.eventsService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate an event by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the event' })
  @ApiResponse({
    status: 200,
    description: 'The event has been successfully activated.',
  })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  activate(@Param('id', ParseIntPipe) id: string) {
    return this.eventsService.activate(id);
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get events statistics' })
  @ApiResponse({
    status: 200,
    description: 'Events statistics summary.',
  })
  getStats(@Query('embassy_id') embassy_id?: string) {
    const embassyIdNum = embassy_id ? parseInt(embassy_id, 10) : undefined;
    return this.eventsService.getStats(embassyIdNum);
  }
}
