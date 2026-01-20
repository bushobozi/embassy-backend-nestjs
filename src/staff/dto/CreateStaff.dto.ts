import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  IsIn,
} from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({
    example: 'https://example.com/photo.jpg',
    description: 'The photo URL of the staff member',
    required: false,
  })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({
    example: 'John',
    description: 'The first name of the staff member',
  })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({
    example: 'A.',
    description: 'The middle name of the staff member',
    required: false,
  })
  @IsOptional()
  @IsString()
  middle_name?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the staff member',
  })
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @ApiProperty({
    example: 'male',
    description: 'The gender of the staff member',
    enum: ['male', 'female', 'other'],
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['male', 'female', 'other'])
  gender: string;

  @ApiProperty({
    example: '1990-05-15',
    description: 'The date of birth of the staff member',
  })
  @IsNotEmpty()
  @IsString()
  date_of_birth: string;

  @ApiProperty({
    example: 'Software Engineer',
    description: 'The position of the staff member within the organization',
  })
  @IsNotEmpty()
  @IsString()
  position: string;

  @ApiProperty({
    example: 'IT Department',
    description: 'The department where the staff member works',
  })
  @IsNotEmpty()
  @IsString()
  department: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email address of the staff member',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the staff member',
  })
  @IsNotEmpty()
  @IsString()
  phone_number: string;

  @ApiProperty({
    example: '123 Main St, Springfield',
    description: 'The address of the staff member',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    example: 'Springfield',
    description: 'The city where the staff member resides',
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    example: 'USA',
    description: 'The country where the staff member resides',
    enum: ['USA', 'Canada', 'UK', 'Australia', 'Uganda', 'Kenya', 'Other'],
  })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({
    example: 'English, Spanish, French',
    description: 'Languages spoken by the staff member',
    enum: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Other'],
    required: false,
  })
  @IsOptional()
  @IsString()
  languages_spoken?: string;

  @ApiProperty({
    example: 'Project Management, Software Development',
    description: 'Skills possessed by the staff member',
    required: false,
  })
  @IsOptional()
  @IsString()
  skills?: string;

  @ApiProperty({
    example: '2024-01-10',
    description: 'The date when the staff member was hired',
  })
  @IsNotEmpty()
  @IsString()
  hired_date: string;

  @ApiProperty({
    example: 'MBA, PMP Certification',
    description: 'Academic and professional qualifications of the staff member',
    required: false,
  })
  @IsOptional()
  @IsString()
  academic_qualifications?: string;

  @ApiProperty({
    example: 'PMP, Scrum Master',
    description: 'Professional qualifications of the staff member',
    required: false,
  })
  @IsOptional()
  @IsString()
  professional_qualifications?: string;

  @ApiProperty({
    example: 'Jane Doe',
    description: 'Name of the emergency contact person',
  })
  @IsNotEmpty()
  @IsString()
  emergency_contact_name: string;

  @ApiProperty({
    example: 'Sister',
    description:
      'Relationship of the emergency contact person to the staff member',
  })
  @IsNotEmpty()
  @IsString()
  emergency_contact_relationship: string;

  @ApiProperty({
    example: '+0987654321',
    description: 'Phone number of the emergency contact person',
  })
  @IsNotEmpty()
  @IsString()
  emergency_contact_phone: string;

  @ApiProperty({
    example: 'Jim Doe',
    description: 'Name of the next of kin',
  })
  @IsNotEmpty()
  @IsString()
  next_of_kin_name: string;

  @ApiProperty({
    example: 'Brother',
    description: 'Relationship of the next of kin to the staff member',
  })
  @IsNotEmpty()
  @IsString()
  next_of_kin_relationship: string;

  @ApiProperty({
    example: '+1122334455',
    description: 'Phone number of the next of kin',
  })
  @IsNotEmpty()
  @IsString()
  next_of_kin_phone: string;

  @ApiProperty({
    example: 'Christianity',
    description: 'The religion of the staff member',
    enum: ['Christianity', 'Islam', 'Hinduism', 'Buddhism', 'Other'],
    required: false,
  })
  @IsOptional()
  @IsString()
  religion?: string;

  @ApiProperty({
    example: 'single',
    description: 'The marital status of the staff member',
    enum: ['single', 'married', 'divorced', 'widowed', 'other'],
    required: false,
  })
  @IsOptional()
  @IsString()
  marital_status?: string;

  @ApiProperty({
    example: 'passport',
    description: 'The type of identification document',
    enum: ['passport', 'national_id', 'driver_license'],
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['passport', 'national_id', 'driver_license'])
  id_type: string;

  @ApiProperty({
    example: 'A12345678',
    description: 'The identification document number',
  })
  @IsNotEmpty()
  @IsString()
  id_number: string;

  @ApiProperty({
    example: '2020-01-01',
    description: 'The issue date of the identification document',
  })
  @IsNotEmpty()
  @IsString()
  id_issue_date: string;

  @ApiProperty({
    example: '2030-01-01',
    description: 'The expiry date of the identification document',
  })
  @IsNotEmpty()
  @IsString()
  id_expiry_date: string;

  @ApiProperty({
    example: 'USA',
    description: 'The nationality of the staff member',
    enum: ['USA', 'Canada', 'UK', 'Australian', 'Ugandan', 'Kenyan', 'Other'],
  })
  @IsNotEmpty()
  @IsString()
  nationality: string;

  @ApiProperty({
    example: 'active',
    description: 'The current status of the staff member',
    enum: ['active', 'inactive', 'on_leave', 'retired'],
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['active', 'inactive', 'on_leave', 'retired'])
  staff_status: string;

  @ApiProperty({
    example: false,
    description: 'Indicates if the staff member has been transferred',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_transferred: boolean;

  @ApiProperty({
    example: '2024-06-01',
    description: 'The date when the staff member was transferred',
    required: false,
  })
  @IsOptional()
  @IsString()
  transfer_date?: string;

  @ApiProperty({
    example: 'Department restructuring',
    description: 'The reason for the staff member transfer',
    required: false,
  })
  @IsOptional()
  @IsString()
  transfer_reason?: string;

  @ApiProperty({
    example: 1,
    description: 'The embassy ID associated with the staff member',
  })
  @IsOptional()
  @IsString()
  embassy_id: string;

  @ApiProperty({
    example: 1,
    description: 'The ID of the user who created the staff record',
  })
  @IsOptional()
  @IsString()
  created_by: string;
}
