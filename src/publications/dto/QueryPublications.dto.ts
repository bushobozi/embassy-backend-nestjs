import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPublicationsDto {
  @ApiPropertyOptional({
    description: 'Filter by embassy ID',
    example: 1,
    type: String,
  })
  @IsOptional()
  @IsString()
  embassy_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by status (draft, published, archived)',
    example: 'published',
    type: String,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by publication type',
    example: 'research_paper',
    type: String,
  })
  @IsOptional()
  @IsString()
  publication_type?: string;

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
