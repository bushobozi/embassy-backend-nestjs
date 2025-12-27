import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  NotFoundException,
  ParseUUIDPipe,
  ParseFilePipe,
  UseInterceptors,
  UploadedFile,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { CreateEmbassyDto, UpdateEmbassyDto } from './export-embassy';
import { EmbassyService } from './embassy.service';
import type { UUID } from 'crypto';
import { ApiConsumes, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';

@ApiTags('Embassy')
@ApiBearerAuth('JWT-auth')
@Controller('embassy')
export class EmbassyController {
  constructor(private readonly embassyService: EmbassyService) {}
  @Get()
  findall() {
    return this.embassyService.findAll();
  }
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('embassy_picture'))
  createEmbassy(
    @Body() createEmbassy: CreateEmbassyDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: 'image/jpeg|image/png' }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Multer.File,
  ) {
    console.log('Uploaded file:', file);
    return this.embassyService.createEmbassy(createEmbassy);
  }
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: UUID) {
    try {
      return this.embassyService.findOne(id);
    } catch (error) {
      // working a database
      /*
      if( error instanceof DatabaseException){
      throw new NotFoundException('Database error occurred while fetching the embassy');
      }
      
      */
      throw new NotFoundException(error || 'Embassy not found');
    }
  }
  @Put(':id')
  updateEmbassy(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Body() updateEmbassyDto: UpdateEmbassyDto,
  ) {
    return this.embassyService.updateEmbassy(id, updateEmbassyDto);
  }
  @Delete(':id')
  removeEmbassy(@Param('id') id: string) {
    return this.embassyService.removeEmbassy(id);
  }
}
