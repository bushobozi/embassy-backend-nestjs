import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NewsService } from './news.service';
import { NewsHeadlinesResponseDto } from './dto/NewsHeadline.dto';

@ApiTags('News')
@ApiBearerAuth('JWT-auth')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('headlines')
  @ApiOperation({ summary: 'Get top 4 news headlines from New Vision Uganda' })
  @ApiResponse({
    status: 200,
    description: 'Returns the top 6 news headlines with caching info',
    type: NewsHeadlinesResponseDto,
  })
  async getHeadlines(): Promise<NewsHeadlinesResponseDto> {
    return this.newsService.getTopHeadlines();
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manually refresh news headlines from New Vision Uganda',
  })
  @ApiResponse({
    status: 200,
    description: 'Headlines refreshed successfully',
    type: NewsHeadlinesResponseDto,
  })
  async refreshHeadlines(): Promise<NewsHeadlinesResponseDto> {
    return this.newsService.refreshHeadlines();
  }
}
