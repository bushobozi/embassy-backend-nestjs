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
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { InformationBoardService } from './information-boards.service';
import {
  CreateBoardDto,
  UpdateBoardDto,
  QueryBoardsDto,
} from './export-information-boards';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Information Boards')
@ApiBearerAuth('JWT-auth')
@Controller('information-boards')
export class InformationBoardsController {
  constructor(
    private readonly informationBoardsService: InformationBoardService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new information board' })
  @ApiResponse({
    status: 201,
    description: 'The information board has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(
    @Body() createBoardDto: CreateBoardDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('embassy_id') embassyId: string,
  ) {
    const finalEmbassyId = createBoardDto.embassy_id || embassyId;
    return this.informationBoardsService.create(createBoardDto, userId, finalEmbassyId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all information boards with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of all information boards matching the filter criteria.',
  })
  getAll(@Query() queryParams: QueryBoardsDto) {
    return this.informationBoardsService.findAll(queryParams);
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get information boards statistics' })
  @ApiQuery({
    name: 'embassy_id',
    required: false,
    description: 'Filter statistics by embassy ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Statistical summary of information boards.',
  })
  getStats(@Query('embassy_id') embassyId?: string) {
    return this.informationBoardsService.getStats(embassyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an information board by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the information board to update',
  })
  @ApiResponse({
    status: 200,
    description: 'The information board has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Information Board not found.' })
  @Put(':id')
  @ApiOperation({ summary: 'Update an information board by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the information board to update',
  })
  @ApiResponse({
    status: 200,
    description: 'The information board has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Information Board not found.' })
  updateBoard(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto) {
    return this.informationBoardsService.update(id, updateBoardDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an information board by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the information board' })
  @ApiResponse({
    status: 200,
    description: 'The information board details.',
  })
  @ApiResponse({ status: 404, description: 'Information Board not found.' })
  getById(@Param('id') id: string) {
    return this.informationBoardsService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an information board by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the information board to delete',
  })
  @ApiResponse({
    status: 204,
    description: 'The information board has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Information Board not found.' })
  remove(@Param('id') id: string) {
    return this.informationBoardsService.remove(id);
  }

  @ApiResponse({
    status: 200,
    description: 'The information board has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Information Board not found.' })
  update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto) {
    return this.informationBoardsService.update(id, updateBoardDto);
  }
}
