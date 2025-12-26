import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryTasksDto {
  @ApiPropertyOptional({
    description: 'Filter by embassy ID',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  embassy_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by assigned user ID',
    example: 3,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assigned_to?: number;

  @ApiPropertyOptional({
    description: 'Filter by creator user ID',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  created_by?: number;

  @ApiPropertyOptional({
    description: 'Filter by status',
    example: 'pending',
    enum: ['pending', 'in_progress', 'completed'],
    type: String,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by priority',
    example: 'high',
    enum: ['low', 'medium', 'high'],
    type: String,
  })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional({
    description: 'Filter by urgent tasks',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value as boolean;
  })
  @IsBoolean()
  is_urgent?: boolean;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 25,
    default: 25,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 25;
}
