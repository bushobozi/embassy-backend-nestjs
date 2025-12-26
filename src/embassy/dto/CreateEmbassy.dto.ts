import { ApiProperty } from '@nestjs/swagger';

export class CreateEmbassyDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The picture of the embassy',
    required: false,
  })
  embassy_picture?: string;
  @ApiProperty({
    example: 'Embassy of Wonderland',
    description: 'The name of the embassy',
  })
  name: string;
  @ApiProperty({
    example: 'Wonderland',
    description: 'The country of the embassy',
  })
  country: string;
  @ApiProperty({
    example: 'Wonderland City',
    description: 'The city of the embassy',
  })
  city: string;
  @ApiProperty({
    example: '123 Embassy St',
    description: 'The address of the embassy',
  })
  address: string;
  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the embassy',
  })
  phone_number: string;
  @ApiProperty({
    example: 'contact@embassy.com',
    description: 'The email of the embassy',
  })
  email: string;
  @ApiProperty({
    example: 'EMB123',
    description: 'The code of the embassy',
    required: false,
  })
  code?: string;
  @ApiProperty({
    example: '12345',
    description: 'The postal code of the embassy',
  })
  postal_code: string;
  @ApiProperty({
    example: '+1234567891',
    description: 'The fax code of the embassy',
  })
  fax_code: string;
  @ApiProperty({
    example: '2020-01-01',
    description: 'The establishment date of the embassy',
  })
  establishment_date: Date;
  @ApiProperty({ example: true, description: 'Is the embassy active?' })
  is_active: boolean;
  @ApiProperty({
    example: true,
    description: 'Does the embassy provide visa services?',
  })
  provides_visa_services: boolean;
  @ApiProperty({
    example: true,
    description: 'Does the embassy provide passport services?',
  })
  provides_passport_services: boolean;
  @ApiProperty({
    example: true,
    description: 'Does the embassy provide consular assistance?',
  })
  provides_consular_assistance: boolean;
  @ApiProperty({
    example: true,
    description: 'Does the embassy provide cultural exchanges?',
  })
  provides_cultural_exchanges: boolean;
  @ApiProperty({
    example: 'https://facebook.com/embassy',
    description: 'The Facebook link of the embassy',
    required: false,
  })
  facebook_link?: string;
  @ApiProperty({
    example: 'https://twitter.com/embassy',
    description: 'The Twitter link of the embassy',
    required: false,
  })
  twitter_link?: string;
  @ApiProperty({
    example: 'https://instagram.com/embassy',
    description: 'The Instagram link of the embassy',
    required: false,
  })
  instagram_link?: string;
  @ApiProperty({
    example: 'https://linkedin.com/company/embassy',
    description: 'The LinkedIn link of the embassy',
    required: false,
  })
  linkedin_link?: string;
  @ApiProperty({
    example: '2023-01-01',
    description: 'The creation date of the embassy record',
    required: false,
  })
  created_at?: Date;
  updated_at?: Date;
}
