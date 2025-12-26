import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  // first name of the user
  @ApiPropertyOptional({
    example: 'John',
    description: 'The first name of the user',
  })
  first_name?: string;
  // middle name of the user
  @ApiPropertyOptional({
    example: 'A.',
    description: 'The middle name of the user',
  })
  middle_name?: string;
  // last name of the user
  @ApiPropertyOptional({
    example: 'Doe',
    description: 'The last name of the user',
  })
  last_name?: string;
  // email of the user
  @ApiPropertyOptional({
    example: 'some@email.com',
    description: 'The email of the user',
  })
  email?: string;
  // password of the user
  @ApiPropertyOptional({
    example: 'strongPassword123!',
    description: 'The password of the user',
  })
  password?: string;
  // role of the user
  @ApiPropertyOptional({
    example: 'admin',
    description: 'The role of the user',
  })
  role?: string;
  // is active status of the user
  @ApiPropertyOptional({
    example: true,
    description: 'The active status of the user',
  })
  is_active?: boolean;
  // phone number of the user
  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'The phone number of the user',
  })
  phone_number?: string;
  // address of the user
  @ApiPropertyOptional({
    example: '123 Main St, Anytown, USA',
    description: 'The address of the user',
  })
  address?: string;
  // date of birth of the user
  @ApiPropertyOptional({
    example: '1990-01-01',
    description: 'The date of birth of the user',
  })
  date_of_birth?: Date;
  // work phone number of the user
  @ApiPropertyOptional({
    example: '+0987654321',
    description: 'The work phone number of the user',
  })
  work_phone_number?: string;
  // work email of the user
  @ApiPropertyOptional({
    example: 'work@email.com',
    description: 'The work email of the user',
  })
  work_email?: string;
  // emergency contact name
  @ApiPropertyOptional({
    example: 'Jane Doe',
    description: 'The emergency contact name',
  })
  emergency_contact_name?: string;
  // emergency contact phone number
  @ApiPropertyOptional({
    example: '+1122334455',
    description: 'The emergency contact phone number',
  })
  emergency_contact_phone_number?: string;
  // emergency contact relationship
  @ApiPropertyOptional({
    example: 'Spouse',
    description: 'The emergency contact relationship',
  })
  emergency_contact_relationship?: string;
  // department of the user
  @ApiPropertyOptional({
    example: 'Human Resources',
    description: 'The department of the user',
  })
  department?: string;
  // position of the user
  @ApiPropertyOptional({
    example: 'Manager',
    description: 'The position of the user',
  })
  position?: string;
  // hire date of the user
  @ApiPropertyOptional({
    example: '2024-01-15',
    description: 'The hire date of the user',
  })
  hire_date?: Date;
  // biography of the user
  @ApiPropertyOptional({
    example: 'Experienced professional with 10+ years in the industry',
    description: 'The biography of the user',
  })
  biography?: string;
  // profile picture URL
  @ApiPropertyOptional({
    example: 'https://example.com/profile.jpg',
    description: 'The profile picture URL of the user',
  })
  profile_picture?: string;
  // languages spoken by the user
  @ApiPropertyOptional({
    example: ['English', 'Spanish', 'French'],
    description: 'The languages spoken by the user',
    type: [String],
  })
  languages?: string[];
  // certifications of the user
  @ApiPropertyOptional({
    example: ['PMP', 'AWS Certified'],
    description: 'The certifications of the user',
    type: [String],
  })
  certifications?: string[];
  // social media links
  @ApiPropertyOptional({
    example: {
      linkedin: 'https://linkedin.com/in/johndoe',
      twitter: '@johndoe',
    },
    description: 'The social media links of the user',
  })
  social_media_links?: Record<string, string>;
  // previous employers
  @ApiPropertyOptional({
    example: ['Company A', 'Company B'],
    description: 'The previous employers of the user',
    type: [String],
  })
  previous_employers?: string[];
  // education background
  @ApiPropertyOptional({
    example: ['BS in Computer Science - MIT', 'MBA - Harvard'],
    description: 'The education background of the user',
    type: [String],
  })
  education?: string[];
  // embassy ID
  @ApiPropertyOptional({
    example: 1,
    description: 'The embassy ID associated with the user',
  })
  embassy_id?: number;
}
