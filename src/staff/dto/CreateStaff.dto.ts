import { ApiProperty } from '@nestjs/swagger';

export class CreateStaffDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The photo of the staff member',
    required: false,
  })
  photo?: string;

  @ApiProperty({
    example: 'John',
    description: 'The first name of the staff member',
  })
  first_name: string;

  @ApiProperty({
    example: 'A.',
    description: 'The middle name of the staff member',
    required: false,
  })
  middle_name?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the staff member',
  })
  last_name: string;

  @ApiProperty({
    example: 'male',
    description: 'The gender of the staff member',
    enum: ['male', 'female', 'other'],
  })
  gender: string;

  @ApiProperty({
    example: '1990-05-15',
    description: 'The date of birth of the staff member',
  })
  date_of_birth: Date;

  @ApiProperty({
    example: 'Software Engineer',
    description: 'The position of the staff member within the organization',
  })
  position: string;

  @ApiProperty({
    example: 'IT Department',
    description: 'The department where the staff member works',
  })
  department: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email address of the staff member',
  })
  email: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the staff member',
  })
  phone_number: string;

  @ApiProperty({
    example: '123 Main St, Springfield',
    description: 'The address of the staff member',
  })
  address: string;

  @ApiProperty({
    example: 'Springfield',
    description: 'The city where the staff member resides',
  })
  city: string;

  @ApiProperty({
    example: 'USA',
    description: 'The country where the staff member resides',
    enum: ['USA', 'Canada', 'UK', 'Australia', 'Uganda', 'Kenya', 'Other'],
  })
  country: string;

  @ApiProperty({
    example: 'English, Spanish, French',
    description: 'Languages spoken by the staff member',
    enum: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Other'],
    required: false,
  })
  languages_spoken?: string;

  @ApiProperty({
    example: 'Project Management, Software Development',
    description: 'Skills possessed by the staff member',
    required: false,
  })
  skills?: string;

  @ApiProperty({
    example: '2024-01-10',
    description: 'The date when the staff member was hired',
  })
  hired_date: Date;

  @ApiProperty({
    example: 'MBA, PMP Certification',
    description: 'Academic and professional qualifications of the staff member',
    required: false,
  })
  academic_qualifications?: string;

  @ApiProperty({
    example: 'PMP, Scrum Master',
    description: 'Professional qualifications of the staff member',
    required: false,
  })
  professional_qualifications?: string;

  @ApiProperty({
    example: 'Jane Doe',
    description: 'Name of the emergency contact person',
  })
  emergency_contact_name: string;

  @ApiProperty({
    example: 'Sister',
    description:
      'Relationship of the emergency contact person to the staff member',
  })
  emergency_contact_relationship: string;

  @ApiProperty({
    example: '+0987654321',
    description: 'Phone number of the emergency contact person',
  })
  emergency_contact_phone: string;

  @ApiProperty({
    example: 'Jim Doe',
    description: 'Name of the next of kin',
  })
  next_of_kin_name: string;

  @ApiProperty({
    example: 'Brother',
    description: 'Relationship of the next of kin to the staff member',
  })
  next_of_kin_relationship: string;

  @ApiProperty({
    example: '+1122334455',
    description: 'Phone number of the next of kin',
  })
  next_of_kin_phone: string;

  @ApiProperty({
    example: 'Christianity',
    description: 'The religion of the staff member',
    enum: ['Christianity', 'Islam', 'Hinduism', 'Buddhism', 'Other'],
    required: false,
  })
  religion?: string;

  @ApiProperty({
    example: 'single',
    description: 'The marital status of the staff member',
    enum: ['single', 'married', 'divorced', 'widowed', 'other'],
    required: false,
  })
  marital_status?: string;

  @ApiProperty({
    example: 'passport',
    description: 'The type of identification document',
    enum: ['passport', 'national_id', 'driver_license'],
  })
  id_type: string;

  @ApiProperty({
    example: 'A12345678',
    description: 'The identification document number',
  })
  id_number: string;

  @ApiProperty({
    example: '2020-01-01',
    description: 'The issue date of the identification document',
  })
  id_issue_date: Date;

  @ApiProperty({
    example: '2030-01-01',
    description: 'The expiry date of the identification document',
  })
  id_expiry_date: Date;

  @ApiProperty({
    example: 'USA',
    description: 'The nationality of the staff member',
    enum: ['USA', 'Canada', 'UK', 'Australian', 'Ugandan', 'Kenyan', 'Other'],
  })
  nationality: string;

  @ApiProperty({
    example: 'active',
    description: 'The current status of the staff member',
    enum: ['active', 'inactive', 'on_leave', 'retired'],
  })
  staff_status: string;

  @ApiProperty({
    example: false,
    description: 'Indicates if the staff member has been transferred',
    default: false,
  })
  is_transferred: boolean;

  @ApiProperty({
    example: '2024-06-01',
    description: 'The date when the staff member was transferred',
    required: false,
  })
  transfer_date?: Date;

  @ApiProperty({
    example: 'Department restructuring',
    description: 'The reason for the staff member transfer',
    required: false,
  })
  transfer_reason?: string;

  @ApiProperty({
    example: 1,
    description: 'The embassy ID associated with the staff member',
  })
  embassy_id: string;

  @ApiProperty({
    example: 1,
    description: 'The ID of the user who created the staff record',
  })
  created_by: string;
}
