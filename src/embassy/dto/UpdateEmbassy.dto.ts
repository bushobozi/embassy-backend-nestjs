import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmbassyDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The picture of the embassy',
    required: false,
  })
  embassy_picture?: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  country?: string;

  @ApiProperty({ required: false })
  city?: string;

  @ApiProperty({ required: false })
  address?: string;

  @ApiProperty({ required: false })
  phone_number?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  code?: string;

  @ApiProperty({ required: false })
  postal_code?: string;

  @ApiProperty({ required: false })
  fax_code?: string;

  @ApiProperty({ required: false })
  establishment_date?: Date;

  @ApiProperty({ required: false })
  is_active?: boolean;

  @ApiProperty({ required: false })
  provides_visa_services?: boolean;

  @ApiProperty({ required: false })
  provides_passport_services?: boolean;

  @ApiProperty({ required: false })
  provides_consular_assistance?: boolean;

  @ApiProperty({ required: false })
  provides_cultural_exchanges?: boolean;

  @ApiProperty({ required: false })
  facebook_link?: string;

  @ApiProperty({ required: false })
  twitter_link?: string;

  @ApiProperty({ required: false })
  instagram_link?: string;

  @ApiProperty({ required: false })
  linkedin_link?: string;
}
