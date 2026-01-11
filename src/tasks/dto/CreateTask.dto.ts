import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsDateString,
  IsEnum,
} from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Prepare quarterly report',
    description: 'The title of the task',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Compile and analyze data for the quarterly performance report.',
    description: 'A detailed description of the task',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '2024-07-15T17:00:00Z',
    description: 'The due date and time for the task completion',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  due_date?: string;

  @ApiProperty({
    example: 'pending',
    description: 'The current status of the task',
    enum: ['pending', 'in_progress', 'completed', 'urgent'],
    required: false,
  })
  @IsEnum(['pending', 'in_progress', 'completed', 'urgent'])
  @IsOptional()
  status?: string;

  @ApiProperty({
    example: 'medium',
    description: 'The priority level of the task',
    enum: ['low', 'medium', 'high'],
    required: false,
  })
  @IsEnum(['low', 'medium', 'high'])
  @IsOptional()
  priority?: string;

  @ApiProperty({
    example: false,
    description: 'Indicates if the task is marked as urgent',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_urgent?: boolean;

  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'The ID of the user to whom the task is assigned',
    required: false,
  })
  @IsString()
  @IsOptional()
  assigned_to?: string;

  @ApiProperty({
    example: '1fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'The ID of the user who created the task',
    required: false,
  })
  @IsString()
  @IsOptional()
  created_by?: string;

  @ApiProperty({
    example: '2fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'The embassy ID associated with the task',
    required: false,
  })
  @IsString()
  @IsOptional()
  embassy_id?: string;
}
