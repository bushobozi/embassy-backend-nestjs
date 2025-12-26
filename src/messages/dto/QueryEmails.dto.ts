import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryEmailsDto {
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
    description: 'Filter by sender ID',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sender_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by receiver ID',
    example: 2,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  receiver_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by status',
    example: 'sent',
    enum: ['draft', 'sent', 'read', 'archived', 'deleted', 'scheduled'],
    type: String,
  })
  @IsOptional()
  @IsString()
  status?: string;

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
