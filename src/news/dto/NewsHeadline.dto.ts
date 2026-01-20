import { ApiProperty } from '@nestjs/swagger';

export class NewsHeadlineDto {
  @ApiProperty({
    example: 'President launches new infrastructure project',
    description: 'The headline title',
  })
  title: string;

  @ApiProperty({
    example: 'https://www.newvision.co.ug/article/123456',
    description: 'Link to the full article',
  })
  url: string;

  @ApiProperty({
    example: 'https://www.newvision.co.ug/images/article123.jpg',
    description: 'Image URL for the headline',
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    example: 'New Vision Uganda',
    description: 'Source of the news',
  })
  source: string;
}

export class NewsHeadlinesResponseDto {
  @ApiProperty({
    type: [NewsHeadlineDto],
    description: 'List of news headlines',
  })
  headlines: NewsHeadlineDto[];

  @ApiProperty({
    example: '2024-01-20T10:30:00.000Z',
    description: 'When the headlines were last fetched',
  })
  fetchedAt: string;

  @ApiProperty({
    example: '2024-01-20T11:00:00.000Z',
    description: 'When the next refresh will occur',
  })
  nextRefreshAt: string;
}
