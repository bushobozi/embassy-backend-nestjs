import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiProperty({
    example: 'Prepare quarterly report',
    description: 'The title of the task',
    required: false,
  })
  title?: string;

  @ApiProperty({
    example: 'Compile and analyze data for the quarterly performance report.',
    description: 'A detailed description of the task',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: '2024-07-15T17:00:00Z',
    description: 'The due date and time for the task completion',
    required: false,
  })
  due_date?: Date;

  @ApiProperty({
    example: 'pending',
    description: 'The current status of the task',
    enum: ['pending', 'in_progress', 'completed'],
    required: false,
  })
  status?: string;

  @ApiProperty({
    example: 'medium',
    description: 'The priority level of the task',
    enum: ['low', 'medium', 'high'],
    required: false,
  })
  priority?: string;

  @ApiProperty({
    example: false,
    description: 'Indicates if the task is marked as urgent',
    required: false,
  })
  is_urgent?: boolean;

  @ApiProperty({
    example: 3,
    description: 'The ID of the user to whom the task is assigned',
    required: false,
  })
  assigned_to?: number;

  @ApiProperty({
    example: 1,
    description: 'The ID of the user who created the task',
    required: false,
  })
  created_by?: number;

  @ApiProperty({
    example: 1,
    description: 'The embassy ID associated with the task',
    required: false,
  })
  embassy_id?: number;
}
