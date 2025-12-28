import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryStaffDto {
  @ApiPropertyOptional({
    description: 'Filter by embassy ID',
    example: '1234567890abcdef',
    type: String,
  })
  @IsOptional()
  @Type(() => String)
  @IsString()
  embassy_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by gender',
    example: 'male',
    enum: ['male', 'female', 'other'],
    type: String,
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({
    description: 'Filter by religion',
    example: 'Christianity',
    enum: ['Christianity', 'Islam', 'Hinduism', 'Buddhism', 'Other'],
    type: String,
  })
  @IsOptional()
  @IsString()
  religion?: string;

  @ApiPropertyOptional({
    description: 'Filter by marital status',
    example: 'single',
    enum: ['single', 'married', 'divorced', 'widowed', 'other'],
    type: String,
  })
  @IsOptional()
  @IsString()
  marital_status?: string;

  @ApiPropertyOptional({
    description: 'Filter by staff status',
    example: 'active',
    enum: ['active', 'inactive', 'on_leave', 'retired'],
    type: String,
  })
  @IsOptional()
  @IsString()
  staff_status?: string;

  @ApiPropertyOptional({
    description: 'Filter by country',
    example: 'USA',
    type: String,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Filter by nationality',
    example: 'USA',
    type: String,
  })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({
    description: 'Filter by department',
    example: 'IT Department',
    type: String,
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    description: 'Filter by position',
    example: 'Software Engineer',
    type: String,
  })
  @IsOptional()
  @IsString()
  position?: string;

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
