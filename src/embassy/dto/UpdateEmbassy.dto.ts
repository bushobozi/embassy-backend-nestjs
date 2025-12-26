import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmbassyDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The picture of the embassy',
    required: false,
  })
  embassy_picture?: string;
  name: string;
  country: string;
  city: string;
  address: string;
  phone_number: string;
  email: string;
  code?: string;
  postal_code: string;
  fax_code: string;
  establishment_date: Date;
  is_active: boolean;
  provides_visa_services: boolean;
  provides_passport_services: boolean;
  provides_consular_assistance: boolean;
  provides_cultural_exchanges: boolean;
  facebook_link?: string;
  twitter_link?: string;
  instagram_link?: string;
  linkedin_link?: string;
  created_at?: Date;
  updated_at?: Date;
}
