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
import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto, QueryStaffDto } from './export-staff';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Staff')
@ApiBearerAuth('JWT-auth')
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new staff member' })
  @ApiResponse({
    status: 201,
    description: 'The staff member has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(
    @Body() createStaffDto: CreateStaffDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.staffService.create(createStaffDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all staff with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of all staff matching the filter criteria.',
  })
  getAll(@Query() queryParams: QueryStaffDto) {
    return this.staffService.findAll(queryParams);
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get staff statistics' })
  @ApiQuery({
    name: 'embassy_id',
    required: false,
    type: String,
    description: 'Filter statistics by embassy ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Staff statistics summary.',
  })
  getStats(@Query('embassy_id') embassy_id?: string) {
    return this.staffService.getStats(embassy_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a staff member by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the staff member' })
  @ApiResponse({
    status: 200,
    description: 'The staff member details.',
  })
  @ApiResponse({ status: 404, description: 'Staff member not found.' })
  getOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a staff member by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the staff member' })
  @ApiResponse({
    status: 200,
    description: 'The staff member has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Staff member not found.' })
  update(
    @Param('id') id: string,
    @Body() updateStaffDto: Partial<UpdateStaffDto>,
  ) {
    return this.staffService.update(id, updateStaffDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a staff member by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the staff member' })
  @ApiResponse({
    status: 204,
    description: 'The staff member has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Staff member not found.' })
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }

  // Status management endpoints
  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate a staff member' })
  @ApiParam({ name: 'id', description: 'The ID of the staff member' })
  @ApiResponse({
    status: 200,
    description: 'The staff member has been activated.',
  })
  @ApiResponse({ status: 404, description: 'Staff member not found.' })
  activate(@Param('id') id: string) {
    return this.staffService.activate(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a staff member' })
  @ApiParam({ name: 'id', description: 'The ID of the staff member' })
  @ApiResponse({
    status: 200,
    description: 'The staff member has been deactivated.',
  })
  @ApiResponse({ status: 404, description: 'Staff member not found.' })
  deactivate(@Param('id') id: string) {
    return this.staffService.deactivate(id);
  }

  @Patch(':id/on-leave')
  @ApiOperation({ summary: 'Set staff member on leave' })
  @ApiParam({ name: 'id', description: 'The ID of the staff member' })
  @ApiResponse({
    status: 200,
    description: 'The staff member has been set on leave.',
  })
  @ApiResponse({ status: 404, description: 'Staff member not found.' })
  setOnLeave(@Param('id') id: string) {
    return this.staffService.setOnLeave(id);
  }

  @Patch(':id/retire')
  @ApiOperation({ summary: 'Retire a staff member' })
  @ApiParam({ name: 'id', description: 'The ID of the staff member' })
  @ApiResponse({
    status: 200,
    description: 'The staff member has been retired.',
  })
  @ApiResponse({ status: 404, description: 'Staff member not found.' })
  retire(@Param('id') id: string) {
    return this.staffService.retire(id);
  }

  // Transfer endpoint
  @Patch(':id/transfer')
  @ApiOperation({ summary: 'Transfer a staff member to another embassy' })
  @ApiParam({ name: 'id', description: 'The ID of the staff member' })
  @ApiQuery({
    name: 'embassy_id',
    required: true,
    type: String,
    description: 'The target embassy ID',
  })
  @ApiQuery({
    name: 'reason',
    required: false,
    type: String,
    description: 'Reason for transfer',
  })
  @ApiResponse({
    status: 200,
    description: 'The staff member has been transferred.',
  })
  @ApiResponse({ status: 404, description: 'Staff member not found.' })
  transfer(
    @Param('id') id: string,
    @Query('embassy_id') embassy_id: string,
    @Query('reason') reason?: string,
  ) {
    return this.staffService.transferStaff(id, embassy_id, reason);
  }
}
