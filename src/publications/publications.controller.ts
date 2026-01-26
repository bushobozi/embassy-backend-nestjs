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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PublicationsService } from './publications.service';
import {
  CreatePublicationDto,
  UpdatePublicationDto,
  QueryPublicationsDto,
} from './export-publications';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTokenGuard } from '../common/guards/api-token.guard';

@ApiTags('Publications')
@ApiBearerAuth('JWT-auth')
@Controller('publications')
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new publication' })
  @ApiResponse({
    status: 201,
    description: 'The publication has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(
    @Body() createPublicationDto: CreatePublicationDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.publicationsService.create(createPublicationDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all publications with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of all publications matching the filter criteria.',
  })
  getAll(@Query() queryParams: QueryPublicationsDto) {
    return this.publicationsService.findAll(queryParams);
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get publications statistics' })
  @ApiQuery({
    name: 'embassy_id',
    required: false,
    type: String,
    description: 'Filter statistics by embassy ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Publications statistics summary.',
  })
  getStats(@Query('embassy_id') embassy_id?: string) {
    return this.publicationsService.getStats(embassy_id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a publication by slug' })
  @ApiParam({ name: 'slug', description: 'The slug of the publication' })
  @ApiResponse({
    status: 200,
    description: 'The publication details.',
  })
  @ApiResponse({ status: 404, description: 'Publication not found.' })
  getBySlug(@Param('slug') slug: string) {
    return this.publicationsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a publication by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the publication' })
  @ApiResponse({
    status: 200,
    description: 'The publication details.',
  })
  @ApiResponse({ status: 404, description: 'Publication not found.' })
  getOne(@Param('id') id: string) {
    return this.publicationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a publication by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the publication' })
  @ApiResponse({
    status: 200,
    description: 'The publication has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Publication not found.' })
  update(
    @Param('id') id: string,
    @Body() updatePublicationDto: Partial<UpdatePublicationDto>,
  ) {
    return this.publicationsService.update(id, updatePublicationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a publication by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the publication' })
  @ApiResponse({
    status: 204,
    description: 'The publication has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Publication not found.' })
  remove(@Param('id') id: string) {
    return this.publicationsService.remove(id);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish a publication by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the publication' })
  @ApiResponse({
    status: 200,
    description: 'The publication has been successfully published.',
  })
  @ApiResponse({ status: 404, description: 'Publication not found.' })
  publish(@Param('id') id: string) {
    return this.publicationsService.publish(id);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive a publication by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the publication' })
  @ApiResponse({
    status: 200,
    description: 'The publication has been successfully archived.',
  })
  @ApiResponse({ status: 404, description: 'Publication not found.' })
  archive(@Param('id') id: string) {
    return this.publicationsService.archive(id);
  }

  @Patch(':id/draft')
  @ApiOperation({ summary: 'Set a publication to draft by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the publication' })
  @ApiResponse({
    status: 200,
    description: 'The publication has been successfully set to draft.',
  })
  @ApiResponse({ status: 404, description: 'Publication not found.' })
  draft(@Param('id') id: string) {
    return this.publicationsService.draft(id);
  }

  @Get('public/:id')
  @Public()
  @UseGuards(ApiTokenGuard)
  @ApiOperation({ summary: 'Get a single published publication by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the publication' })
  @ApiResponse({
    status: 200,
    description: 'The published publication details.',
  })
  @ApiResponse({ status: 404, description: 'Published publication not found.' })
  findOnePublic(@Param('id') id: string) {
    return this.publicationsService.findOnePublic(id);
  }

  @Get('public/country/:country')
  @Public()
  @UseGuards(ApiTokenGuard)
  @ApiOperation({
    summary: 'Get published publications by country and optional city',
  })
  @ApiParam({
    name: 'country',
    description: 'Country name to filter publications by (case-insensitive)',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    description: 'City name to further filter publications (case-insensitive)',
  })
  @ApiQuery({
    name: 'publication_type',
    required: false,
    description: 'Filter by publication type',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 5)',
  })
  @ApiResponse({
    status: 200,
    description:
      'List of published publications for the specified country/city.',
  })
  async findByCountryPublic(
    @Param('country') country: string,
    @Query('city') city?: string,
    @Query('publication_type') publication_type?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.publicationsService.findByCountryPublic(country, city, {
      page,
      limit,
      publication_type,
    });
  }
}
