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
}
