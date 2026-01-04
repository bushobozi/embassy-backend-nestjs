import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, QueryTasksDto } from './export-tasks';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Tasks')
@ApiBearerAuth('JWT-auth')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({
    status: 201,
    description: 'The task has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.tasksService.create(createTaskDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of all tasks matching the filter criteria.',
  })
  getAll(@Query() queryParams: QueryTasksDto) {
    return this.tasksService.findAll(queryParams);
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get tasks statistics' })
  @ApiQuery({
    name: 'embassy_id',
    required: false,
    type: String,
    description: 'Filter statistics by embassy ID',
  })
  @ApiQuery({
    name: 'assigned_to',
    required: false,
    type: String,
    description: 'Filter statistics by assigned user ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Tasks statistics summary.',
  })
  getStats(
    @Query('embassy_id') embassy_id?: string,
    @Query('assigned_to') assigned_to?: string,
  ) {
    return this.tasksService.getStats(embassy_id, assigned_to);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the task' })
  @ApiResponse({
    status: 200,
    description: 'The task details.',
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  getOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the task' })
  @ApiResponse({
    status: 200,
    description: 'The task has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: Partial<UpdateTaskDto>,
  ) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the task' })
  @ApiResponse({
    status: 204,
    description: 'The task has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  // Status management endpoints
  @Patch(':id/status/pending')
  @ApiOperation({ summary: 'Mark task as pending' })
  @ApiParam({ name: 'id', description: 'The ID of the task' })
  @ApiResponse({
    status: 200,
    description: 'The task has been marked as pending.',
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  markAsPending(@Param('id') id: string) {
    return this.tasksService.markAsPending(id);
  }

  @Patch(':id/status/in-progress')
  @ApiOperation({ summary: 'Mark task as in progress' })
  @ApiParam({ name: 'id', description: 'The ID of the task' })
  @ApiResponse({
    status: 200,
    description: 'The task has been marked as in progress.',
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  markAsInProgress(@Param('id') id: string) {
    return this.tasksService.markAsInProgress(id);
  }

  @Patch(':id/status/completed')
  @ApiOperation({ summary: 'Mark task as completed' })
  @ApiParam({ name: 'id', description: 'The ID of the task' })
  @ApiResponse({
    status: 200,
    description: 'The task has been marked as completed.',
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  markAsCompleted(@Param('id') id: string) {
    return this.tasksService.markAsCompleted(id);
  }

  // Priority management endpoints
  @Patch(':id/priority/low')
  @ApiOperation({ summary: 'Set task priority to low' })
  @ApiParam({ name: 'id', description: 'The ID of the task' })
  @ApiResponse({
    status: 200,
    description: 'The task priority has been set to low.',
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  setLowPriority(@Param('id') id: string) {
    return this.tasksService.setLowPriority(id);
  }

  @Patch(':id/priority/medium')
  @ApiOperation({ summary: 'Set task priority to medium' })
  @ApiParam({ name: 'id', description: 'The ID of the task' })
  @ApiResponse({
    status: 200,
    description: 'The task priority has been set to medium.',
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  setMediumPriority(@Param('id') id: string) {
    return this.tasksService.setMediumPriority(id);
  }

  @Patch(':id/priority/high')
  @ApiOperation({ summary: 'Set task priority to high' })
  @ApiParam({ name: 'id', description: 'The ID of the task' })
  @ApiResponse({
    status: 200,
    description: 'The task priority has been set to high.',
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  setHighPriority(@Param('id') id: string) {
    return this.tasksService.setHighPriority(id);
  }

  // Urgent flag endpoints
  @Patch(':id/mark-urgent')
  @ApiOperation({ summary: 'Mark task as urgent' })
  @ApiParam({ name: 'id', description: 'The ID of the task' })
  @ApiResponse({
    status: 200,
    description: 'The task has been marked as urgent.',
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  markAsUrgent(@Param('id') id: string) {
    return this.tasksService.markAsUrgent(id);
  }

  @Patch(':id/unmark-urgent')
  @ApiOperation({ summary: 'Remove urgent flag from task' })
  @ApiParam({ name: 'id', description: 'The ID of the task' })
  @ApiResponse({
    status: 200,
    description: 'The urgent flag has been removed from the task.',
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  unmarkAsUrgent(@Param('id') id: string) {
    return this.tasksService.unmarkAsUrgent(id);
  }
}
