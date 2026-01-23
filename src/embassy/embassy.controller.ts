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
  Req,
} from '@nestjs/common';
import { CreateEmbassyDto, UpdateEmbassyDto } from './export-embassy';
import { EmbassyService } from './embassy.service';
import type { UUID } from 'crypto';
import {
  ApiConsumes,
  ApiBearerAuth,
  ApiTags,
  ApiBody,
  ApiOperation,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';

interface UploadedFileType {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

interface EmbassyFormData {
  name?: string;
  country?: string;
  city?: string;
  address?: string;
  phone_number?: string;
  email?: string;
  code?: string;
  postal_code?: string;
  fax_code?: string;
  establishment_date?: string;
  provides_visa_services?: string | boolean;
  provides_passport_services?: string | boolean;
  provides_consular_assistance?: string | boolean;
  provides_cultural_exchanges?: string | boolean;
  facebook_link?: string;
  twitter_link?: string;
  instagram_link?: string;
  linkedin_link?: string;
  is_active?: string | boolean;
}

@ApiTags('Embassy')
@ApiBearerAuth('JWT-auth')
@Controller('embassy')
export class EmbassyController {
  constructor(private readonly embassyService: EmbassyService) {}
  @Get()
  @ApiOperation({ summary: 'Get all embassies' })
  findall() {
    return this.embassyService.findAll();
  }
  @Post()
  @ApiOperation({ summary: 'Create a new embassy' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        country: { type: 'string' },
        city: { type: 'string' },
        address: { type: 'string' },
        phone_number: { type: 'string' },
        email: { type: 'string' },
        code: { type: 'string' },
        postal_code: { type: 'string' },
        fax_code: { type: 'string' },
        establishment_date: { type: 'string', format: 'date' },
        provides_visa_services: { type: 'boolean' },
        provides_passport_services: { type: 'boolean' },
        provides_consular_assistance: { type: 'boolean' },
        provides_cultural_exchanges: { type: 'boolean' },
        facebook_link: { type: 'string' },
        twitter_link: { type: 'string' },
        instagram_link: { type: 'string' },
        linkedin_link: { type: 'string' },
        embassy_picture: {
          type: 'string',
          format: 'binary',
          description: 'Embassy picture (max 10MB, jpg/png/svg/webp)',
        },
      },
      required: ['name', 'country', 'city'],
    },
  })
  @UseInterceptors(FileInterceptor('embassy_picture'))
  createEmbassy(
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: 'image/jpeg|image/png|image/jpg|image/svg+xml|image/webp',
          }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: UploadedFileType,
  ) {
    // Extract form data from request body
    const body = req.body as EmbassyFormData;
    const createEmbassy: CreateEmbassyDto = {
      name: body.name!,
      country: body.country!,
      city: body.city!,
      address: body.address,
      phone_number: body.phone_number,
      email: body.email,
      code: body.code,
      postal_code: body.postal_code,
      fax_code: body.fax_code,
      establishment_date: body.establishment_date
        ? new Date(body.establishment_date)
        : undefined,
      provides_visa_services:
        body.provides_visa_services === 'true' ||
        body.provides_visa_services === true,
      provides_passport_services:
        body.provides_passport_services === 'true' ||
        body.provides_passport_services === true,
      provides_consular_assistance:
        body.provides_consular_assistance === 'true' ||
        body.provides_consular_assistance === true,
      provides_cultural_exchanges:
        body.provides_cultural_exchanges === 'true' ||
        body.provides_cultural_exchanges === true,
      facebook_link: body.facebook_link,
      twitter_link: body.twitter_link,
      instagram_link: body.instagram_link,
      linkedin_link: body.linkedin_link,
      embassy_picture: file
        ? `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
        : undefined,
    };

    console.log('Create Embassy DTO:', createEmbassy);
    console.log('Uploaded file:', file);

    return this.embassyService.createEmbassy(createEmbassy);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get embassy by ID' })
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
  @ApiOperation({ summary: 'Update embassy by ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        country: { type: 'string' },
        city: { type: 'string' },
        address: { type: 'string' },
        phone_number: { type: 'string' },
        email: { type: 'string' },
        code: { type: 'string' },
        postal_code: { type: 'string' },
        fax_code: { type: 'string' },
        establishment_date: { type: 'string', format: 'date' },
        is_active: { type: 'boolean' },
        provides_visa_services: { type: 'boolean' },
        provides_passport_services: { type: 'boolean' },
        provides_consular_assistance: { type: 'boolean' },
        provides_cultural_exchanges: { type: 'boolean' },
        facebook_link: { type: 'string' },
        twitter_link: { type: 'string' },
        instagram_link: { type: 'string' },
        linkedin_link: { type: 'string' },
        embassy_picture: {
          type: 'string',
          format: 'binary',
          description: 'Embassy picture (max 5MB, jpg/png)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('embassy_picture'))
  updateEmbassy(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: 'image/jpeg|image/png' }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: UploadedFileType,
  ) {
    // Extract form data from request body
    const body = req.body as EmbassyFormData;
    const updateEmbassyDto: UpdateEmbassyDto = {
      name: body.name,
      country: body.country,
      city: body.city,
      address: body.address,
      phone_number: body.phone_number,
      email: body.email,
      code: body.code,
      postal_code: body.postal_code,
      fax_code: body.fax_code,
      establishment_date: body.establishment_date
        ? new Date(body.establishment_date)
        : undefined,
      is_active: body.is_active === 'true' || body.is_active === true,
      provides_visa_services:
        body.provides_visa_services === 'true' ||
        body.provides_visa_services === true,
      provides_passport_services:
        body.provides_passport_services === 'true' ||
        body.provides_passport_services === true,
      provides_consular_assistance:
        body.provides_consular_assistance === 'true' ||
        body.provides_consular_assistance === true,
      provides_cultural_exchanges:
        body.provides_cultural_exchanges === 'true' ||
        body.provides_cultural_exchanges === true,
      facebook_link: body.facebook_link,
      twitter_link: body.twitter_link,
      instagram_link: body.instagram_link,
      linkedin_link: body.linkedin_link,
      embassy_picture: file
        ? `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
        : undefined,
    };

    console.log('Update Embassy DTO:', updateEmbassyDto);
    console.log('Uploaded file:', file);

    return this.embassyService.updateEmbassy(id, updateEmbassyDto);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Delete embassy by ID' })
  removeEmbassy(@Param('id') id: string) {
    return this.embassyService.removeEmbassy(id);
  }
}
