import { ApiProperty } from '@nestjs/swagger';

// title, description, due_date
// status (pending, in_progress, completed)
// priority (low, medium, high)
// is_urgent
// assigned_to - user_id
// created_by - user_id
// created_at, updated_at
// belongs to embassy_id

export class CreateTaskDto {
  @ApiProperty({
    example: 'Prepare quarterly report',
    description: 'The title of the task',
  })
  title: string;

  @ApiProperty({
    example: 'Compile and analyze data for the quarterly performance report.',
    description: 'A detailed description of the task',
  })
  description: string;

  @ApiProperty({
    example: '2024-07-15T17:00:00Z',
    description: 'The due date and time for the task completion',
  })
  due_date: Date;

  @ApiProperty({
    example: 'pending',
    description: 'The current status of the task',
    enum: ['pending', 'in_progress', 'completed', 'urgent'],
  })
  status: string;

  @ApiProperty({
    example: 'medium',
    description: 'The priority level of the task',
    enum: ['low', 'medium', 'high'],
  })
  priority: string;

  @ApiProperty({
    example: false,
    description: 'Indicates if the task is marked as urgent',
    default: false,
  })
  is_urgent: boolean;

  @ApiProperty({
    example: 3,
    description: 'The ID of the user to whom the task is assigned',
  })
  assigned_to: number;

  @ApiProperty({
    example: 1,
    description: 'The ID of the user who created the task',
  })
  created_by: number;

  @ApiProperty({
    example: 1,
    description: 'The embassy ID associated with the task',
  })
  embassy_id: number;
}
