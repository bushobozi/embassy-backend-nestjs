import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// first name, middle name, last name, email, password, role
// is_active, phone_number, address, date_of_birth, work_phone_number
// work_email, emergency_contact_name, emergency_contact_phone_number
// emergency_contact_relationship, department, position, hire_date
// biography, profile_picture, languages, certifications
// hire_date, social_media_links, previous_employers, education
// created_at, updated_at
// embassy_id

export class CreateUserDto {
  // first name of the user
  @ApiProperty({
    example: 'John',
    description: 'The first name of the user',
  })
  first_name: string;
  // middle name of the user
  @ApiProperty({
    example: 'A.',
    description: 'The middle name of the user',
    required: false,
  })
  middle_name?: string;
  // last name of the user
  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the user',
  })
  last_name: string;
  // email of the user
  @ApiProperty({
    example: 'some@email.com',
    description: 'The email of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  // password of the user
  @ApiProperty({
    example: 'strongPassword123!',
    description: 'The password of the user',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
  // role of the user
  @ApiProperty({
    example: 'admin',
    description: 'The role of the user',
  })
  role: string;
  // is active status of the user
  @ApiProperty({
    example: true,
    description: 'The active status of the user',
  })
  is_active: boolean;
  // phone number of the user
  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the user',
  })
  phone_number: string;
  // address of the user
  @ApiProperty({
    example: '123 Main St, Anytown, USA',
    description: 'The address of the user',
  })
  address: string;
  // date of birth of the user
  @ApiProperty({
    example: '1990-01-01',
    description: 'The date of birth of the user',
  })
  date_of_birth: string;
  // work phone number of the user
  @ApiProperty({
    example: '+0987654321',
    description: 'The work phone number of the user',
    required: false,
  })
  work_phone_number?: string;
  // work email of the user
  @ApiProperty({
    example: 'work@email.com',
    description: 'The work email of the user',
    required: false,
  })
  work_email?: string;
  // emergency contact name
  @ApiProperty({
    example: 'Jane Doe',
    description: 'The emergency contact name',
    required: false,
  })
  emergency_contact_name?: string;
  // emergency contact phone number
  @ApiProperty({
    example: '+1122334455',
    description: 'The emergency contact phone number',
    required: false,
  })
  emergency_contact_phone_number?: string;
  // emergency contact relationship
  @ApiProperty({
    example: 'Spouse',
    description: 'The emergency contact relationship',
    required: false,
  })
  emergency_contact_relationship?: string;
  // department of the user
  @ApiProperty({
    example: 'Human Resources',
    description: 'The department of the user',
    required: false,
  })
  department?: string;
  // position of the user
  @ApiProperty({
    example: 'Manager',
    description: 'The position of the user',
    required: false,
  })
  position?: string;
  // hire date of the user
  @ApiProperty({
    example: '2024-01-15',
    description: 'The hire date of the user',
    required: false,
  })
  hire_date?: string;
  // biography of the user
  @ApiProperty({
    example: 'Experienced professional with 10+ years in the industry',
    description: 'The biography of the user',
    required: false,
  })
  biography?: string;
  // profile picture URL
  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: 'The profile picture URL of the user',
    required: false,
  })
  profile_picture?: string;
  // languages spoken by the user
  @ApiProperty({
    example: ['English', 'Spanish', 'French'],
    description: 'The languages spoken by the user',
    required: false,
    type: [String],
  })
  languages?: string[];
  // certifications of the user
  @ApiProperty({
    example: ['PMP', 'AWS Certified'],
    description: 'The certifications of the user',
    required: false,
    type: [String],
  })
  certifications?: string[];
  // social media links
  @ApiProperty({
    example: {
      linkedin: 'https://linkedin.com/in/johndoe',
      twitter: '@johndoe',
    },
    description: 'The social media links of the user',
    required: false,
  })
  social_media_links?: Record<string, string>;
  // previous employers
  @ApiProperty({
    example: ['Company A', 'Company B'],
    description: 'The previous employers of the user',
    required: false,
    type: [String],
  })
  previous_employers?: string[];
  // education background
  @ApiProperty({
    example: ['BS in Computer Science - MIT', 'MBA - Harvard'],
    description: 'The education background of the user',
    required: false,
    type: [String],
  })
  education?: string[];
  // embassy ID
  @ApiProperty({
    example: 1,
    description: 'The embassy ID associated with the user',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  embassy_id: string;
}
