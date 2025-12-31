import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateStaffDto, UpdateStaffDto, QueryStaffDto } from './export-staff';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async findAll(queryParams?: QueryStaffDto) {
    const where: any = {};

    if (queryParams) {
      if (queryParams.embassy_id !== undefined) {
        where.embassy_id = queryParams.embassy_id;
      }

      if (queryParams.gender !== undefined) {
        where.gender = queryParams.gender;
      }

      if (queryParams.religion !== undefined) {
        where.religion = queryParams.religion;
      }

      if (queryParams.marital_status !== undefined) {
        where.marital_status = queryParams.marital_status;
      }

      if (queryParams.staff_status !== undefined) {
        where.staff_status = queryParams.staff_status;
      }

      if (queryParams.country !== undefined) {
        where.country = queryParams.country;
      }

      if (queryParams.nationality !== undefined) {
        where.nationality = queryParams.nationality;
      }

      if (queryParams.department !== undefined) {
        where.department = queryParams.department;
      }

      if (queryParams.position !== undefined) {
        where.position = queryParams.position;
      }
    }

    const page = Number(queryParams?.page) || 1;
    const limit = Number(queryParams?.limit) || 25;
    const skip = (page - 1) * limit;

    const [staff, total] = await Promise.all([
      this.prisma.staff.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
        select: {
          id: true,
          user_id: true,
          embassy_id: true,
          first_name: true,
          middle_name: true,
          last_name: true,
          email: true,
          phone: true,
          position: true,
          department: true,
          gender: true,
          religion: true,
          marital_status: true,
          country: true,
          city: true,
          nationality: true,
          staff_status: true,
          hire_date: true,
          date_of_birth: true,
          address: true,
          work_email: true,
          work_phone: true,
          languages_spoken: true,
          skills: true,
          academic_qualifications: true,
          professional_qualifications: true,
          emergency_contact_name: true,
          emergency_contact_relationship: true,
          emergency_contact_phone: true,
          next_of_kin_name: true,
          next_of_kin_relationship: true,
          next_of_kin_phone: true,
          id_type: true,
          id_number: true,
          id_issue_date: true,
          id_expiry_date: true,
          is_transferred: true,
          transfer_date: true,
          transfer_reason: true,
          photo: true,
          created_at: true,
          updated_at: true,
        },
      }),
      this.prisma.staff.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: staff,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      select: {
        id: true,
        user_id: true,
        embassy_id: true,
        first_name: true,
        middle_name: true,
        last_name: true,
        email: true,
        phone: true,
        position: true,
        department: true,
        gender: true,
        religion: true,
        marital_status: true,
        country: true,
        city: true,
        nationality: true,
        staff_status: true,
        hire_date: true,
        date_of_birth: true,
        address: true,
        work_email: true,
        work_phone: true,
        languages_spoken: true,
        skills: true,
        academic_qualifications: true,
        professional_qualifications: true,
        emergency_contact_name: true,
        emergency_contact_relationship: true,
        emergency_contact_phone: true,
        next_of_kin_name: true,
        next_of_kin_relationship: true,
        next_of_kin_phone: true,
        id_type: true,
        id_number: true,
        id_issue_date: true,
        id_expiry_date: true,
        is_transferred: true,
        transfer_date: true,
        transfer_reason: true,
        photo: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!staff) {
      throw new NotFoundException(`Staff member with ID ${id} not found`);
    }
    return staff;
  }

  async create(createStaffDto: CreateStaffDto, creatorUserId: string) {
    // Validate that createStaffDto is not undefined
    if (!createStaffDto) {
      throw new BadRequestException('Staff data is required');
    }

    // Validate required fields
    if (!createStaffDto.email) {
      throw new BadRequestException('Email is required');
    }
    if (!createStaffDto.first_name) {
      throw new BadRequestException('First name is required');
    }
    if (!createStaffDto.last_name) {
      throw new BadRequestException('Last name is required');
    }

    // Get the creator's staff profile to verify they have permission and get embassy_id
    const creatorStaff = await this.prisma.staff.findUnique({
      where: { user_id: creatorUserId },
      select: { embassy_id: true },
    });

    if (!creatorStaff) {
      throw new BadRequestException(
        'Only staff members can create new staff profiles',
      );
    }

    // Use embassy_id from creator's profile or from DTO
    const embassy_id = createStaffDto.embassy_id || creatorStaff.embassy_id;

    // Validate embassy_id
    if (!embassy_id) {
      throw new BadRequestException('Embassy ID is required');
    }

    // Verify the embassy exists
    const embassy = await this.prisma.embassy.findUnique({
      where: { id: embassy_id },
    });

    if (!embassy) {
      throw new NotFoundException(`Embassy with ID ${embassy_id} not found`);
    }

    // Check if the email is already in use
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createStaffDto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        'This email is already registered in the system',
      );
    }

    // Check if staff email is already in use
    const existingStaffByEmail = await this.prisma.staff.findUnique({
      where: { email: createStaffDto.email },
    });

    if (existingStaffByEmail) {
      throw new ConflictException(
        'This email is already in use by another staff member',
      );
    }

    // Generate a default password (staff member should change this on first login)
    const defaultPassword = 'Staff@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Helper function to safely parse dates
    const parseDate = (dateString?: string) => {
      if (!dateString || dateString.trim() === '') return null;
      try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
      } catch {
        return null;
      }
    };

    // Create the user and staff profile in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create the user account
      const newUser = await tx.user.create({
        data: {
          email: createStaffDto.email,
          password: hashedPassword,
          first_name: createStaffDto.first_name,
          middle_name: createStaffDto.middle_name || null,
          last_name: createStaffDto.last_name,
          role: 'staff',
          is_active: true,
          phone_number: createStaffDto.phone_number || null,
          address: createStaffDto.address || null,
          date_of_birth: createStaffDto.date_of_birth || null,
          department: createStaffDto.department || null,
          position: createStaffDto.position || null,
          hire_date: parseDate(createStaffDto.hired_date),
          profile_picture:
            typeof createStaffDto.photo === 'string'
              ? createStaffDto.photo
              : null,
          emergency_contact_name: createStaffDto.emergency_contact_name || null,
          emergency_contact_phone_number:
            createStaffDto.emergency_contact_phone || null,
          emergency_contact_relationship:
            createStaffDto.emergency_contact_relationship || null,
        },
      });

      // Create the staff profile linked to the user
      const newStaff = await tx.staff.create({
        data: {
          user_id: newUser.id,
          embassy_id: embassy_id,
          first_name: createStaffDto.first_name,
          middle_name: createStaffDto.middle_name || null,
          last_name: createStaffDto.last_name,
          email: createStaffDto.email,
          phone: createStaffDto.phone_number || null,
          position: createStaffDto.position || null,
          department: createStaffDto.department || null,
          gender: createStaffDto.gender || null,
          religion: createStaffDto.religion || null,
          marital_status: createStaffDto.marital_status || null,
          country: createStaffDto.country || null,
          city: createStaffDto.city || null,
          nationality: createStaffDto.nationality || null,
          staff_status: createStaffDto.staff_status || 'active',
          hire_date: parseDate(createStaffDto.hired_date),
          date_of_birth: createStaffDto.date_of_birth || null,
          address: createStaffDto.address || null,
          work_email: createStaffDto.email,
          work_phone: createStaffDto.phone_number || null,
          languages_spoken: createStaffDto.languages_spoken || null,
          skills: createStaffDto.skills || null,
          academic_qualifications:
            createStaffDto.academic_qualifications || null,
          professional_qualifications:
            createStaffDto.professional_qualifications || null,
          emergency_contact_name: createStaffDto.emergency_contact_name || null,
          emergency_contact_relationship:
            createStaffDto.emergency_contact_relationship || null,
          emergency_contact_phone:
            createStaffDto.emergency_contact_phone || null,
          next_of_kin_name: createStaffDto.next_of_kin_name || null,
          next_of_kin_relationship:
            createStaffDto.next_of_kin_relationship || null,
          next_of_kin_phone: createStaffDto.next_of_kin_phone || null,
          id_type: createStaffDto.id_type || null,
          id_number: createStaffDto.id_number || null,
          id_issue_date: createStaffDto.id_issue_date || null,
          id_expiry_date: createStaffDto.id_expiry_date || null,
          is_transferred: createStaffDto.is_transferred || false,
          transfer_date: parseDate(createStaffDto.transfer_date),
          transfer_reason: createStaffDto.transfer_reason || null,
          photo:
            typeof createStaffDto.photo === 'string'
              ? createStaffDto.photo
              : null,
        },
        select: {
          id: true,
          user_id: true,
          embassy_id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          position: true,
          department: true,
          gender: true,
          religion: true,
          marital_status: true,
          country: true,
          city: true,
          nationality: true,
          staff_status: true,
          hire_date: true,
          date_of_birth: true,
          address: true,
          work_email: true,
          work_phone: true,
          languages_spoken: true,
          skills: true,
          academic_qualifications: true,
          professional_qualifications: true,
          emergency_contact_name: true,
          emergency_contact_relationship: true,
          emergency_contact_phone: true,
          next_of_kin_name: true,
          next_of_kin_relationship: true,
          next_of_kin_phone: true,
          id_type: true,
          id_number: true,
          id_issue_date: true,
          id_expiry_date: true,
          is_transferred: true,
          transfer_date: true,
          transfer_reason: true,
          photo: true,
          created_at: true,
          updated_at: true,
        },
      });

      return newStaff;
    });

    return result;
  }

  async update(id: string, updateStaffDto: Partial<UpdateStaffDto>) {
    // Check if staff exists
    await this.findOne(id);

    // Helper function to safely parse dates
    const parseDate = (dateString?: string) => {
      if (!dateString || dateString.trim() === '') return null;
      try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
      } catch {
        return null;
      }
    };

    // Map DTO fields to schema fields
    const dataToUpdate: any = {};

    if (updateStaffDto.first_name !== undefined) {
      dataToUpdate.first_name = updateStaffDto.first_name;
    }
    if (updateStaffDto.middle_name !== undefined) {
      dataToUpdate.middle_name = updateStaffDto.middle_name;
    }
    if (updateStaffDto.last_name !== undefined) {
      dataToUpdate.last_name = updateStaffDto.last_name;
    }
    if (updateStaffDto.email !== undefined) {
      dataToUpdate.email = updateStaffDto.email;
    }
    if (updateStaffDto.phone_number !== undefined) {
      dataToUpdate.phone = updateStaffDto.phone_number;
    }
    if (updateStaffDto.position !== undefined) {
      dataToUpdate.position = updateStaffDto.position;
    }
    if (updateStaffDto.department !== undefined) {
      dataToUpdate.department = updateStaffDto.department;
    }
    if (updateStaffDto.gender !== undefined) {
      dataToUpdate.gender = updateStaffDto.gender;
    }
    if (updateStaffDto.religion !== undefined) {
      dataToUpdate.religion = updateStaffDto.religion;
    }
    if (updateStaffDto.marital_status !== undefined) {
      dataToUpdate.marital_status = updateStaffDto.marital_status;
    }
    if (updateStaffDto.country !== undefined) {
      dataToUpdate.country = updateStaffDto.country;
    }
    if (updateStaffDto.city !== undefined) {
      dataToUpdate.city = updateStaffDto.city;
    }
    if (updateStaffDto.nationality !== undefined) {
      dataToUpdate.nationality = updateStaffDto.nationality;
    }
    if (updateStaffDto.staff_status !== undefined) {
      dataToUpdate.staff_status = updateStaffDto.staff_status;
    }
    if (updateStaffDto.hired_date !== undefined) {
      dataToUpdate.hire_date = parseDate(updateStaffDto.hired_date);
    }
    if (updateStaffDto.date_of_birth !== undefined) {
      dataToUpdate.date_of_birth = updateStaffDto.date_of_birth;
    }
    if (updateStaffDto.address !== undefined) {
      dataToUpdate.address = updateStaffDto.address;
    }
    if (updateStaffDto.languages_spoken !== undefined) {
      dataToUpdate.languages_spoken = updateStaffDto.languages_spoken;
    }
    if (updateStaffDto.skills !== undefined) {
      dataToUpdate.skills = updateStaffDto.skills;
    }
    if (updateStaffDto.academic_qualifications !== undefined) {
      dataToUpdate.academic_qualifications =
        updateStaffDto.academic_qualifications;
    }
    if (updateStaffDto.professional_qualifications !== undefined) {
      dataToUpdate.professional_qualifications =
        updateStaffDto.professional_qualifications;
    }
    if (updateStaffDto.emergency_contact_name !== undefined) {
      dataToUpdate.emergency_contact_name =
        updateStaffDto.emergency_contact_name;
    }
    if (updateStaffDto.emergency_contact_relationship !== undefined) {
      dataToUpdate.emergency_contact_relationship =
        updateStaffDto.emergency_contact_relationship;
    }
    if (updateStaffDto.emergency_contact_phone !== undefined) {
      dataToUpdate.emergency_contact_phone =
        updateStaffDto.emergency_contact_phone;
    }
    if (updateStaffDto.next_of_kin_name !== undefined) {
      dataToUpdate.next_of_kin_name = updateStaffDto.next_of_kin_name;
    }
    if (updateStaffDto.next_of_kin_relationship !== undefined) {
      dataToUpdate.next_of_kin_relationship =
        updateStaffDto.next_of_kin_relationship;
    }
    if (updateStaffDto.next_of_kin_phone !== undefined) {
      dataToUpdate.next_of_kin_phone = updateStaffDto.next_of_kin_phone;
    }
    if (updateStaffDto.id_type !== undefined) {
      dataToUpdate.id_type = updateStaffDto.id_type;
    }
    if (updateStaffDto.id_number !== undefined) {
      dataToUpdate.id_number = updateStaffDto.id_number;
    }
    if (updateStaffDto.id_issue_date !== undefined) {
      dataToUpdate.id_issue_date = updateStaffDto.id_issue_date;
    }
    if (updateStaffDto.id_expiry_date !== undefined) {
      dataToUpdate.id_expiry_date = updateStaffDto.id_expiry_date;
    }
    if (updateStaffDto.is_transferred !== undefined) {
      dataToUpdate.is_transferred = updateStaffDto.is_transferred;
    }
    if (updateStaffDto.transfer_date !== undefined) {
      dataToUpdate.transfer_date = parseDate(updateStaffDto.transfer_date);
    }
    if (updateStaffDto.transfer_reason !== undefined) {
      dataToUpdate.transfer_reason = updateStaffDto.transfer_reason;
    }
    if (updateStaffDto.photo !== undefined) {
      dataToUpdate.photo =
        typeof updateStaffDto.photo === 'string' ? updateStaffDto.photo : null;
    }
    if (updateStaffDto.embassy_id !== undefined) {
      dataToUpdate.embassy_id = updateStaffDto.embassy_id;
    }

    const staff = await this.prisma.staff.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        user_id: true,
        embassy_id: true,
        first_name: true,
        middle_name: true,
        last_name: true,
        email: true,
        phone: true,
        position: true,
        department: true,
        gender: true,
        religion: true,
        marital_status: true,
        country: true,
        city: true,
        nationality: true,
        staff_status: true,
        hire_date: true,
        date_of_birth: true,
        address: true,
        work_email: true,
        work_phone: true,
        languages_spoken: true,
        skills: true,
        academic_qualifications: true,
        professional_qualifications: true,
        emergency_contact_name: true,
        emergency_contact_relationship: true,
        emergency_contact_phone: true,
        next_of_kin_name: true,
        next_of_kin_relationship: true,
        next_of_kin_phone: true,
        id_type: true,
        id_number: true,
        id_issue_date: true,
        id_expiry_date: true,
        is_transferred: true,
        transfer_date: true,
        transfer_reason: true,
        photo: true,
        created_at: true,
        updated_at: true,
      },
    });

    return staff;
  }

  async remove(id: string) {
    // Check if staff exists
    await this.findOne(id);

    return this.prisma.staff.delete({
      where: { id },
      select: {
        id: true,
        user_id: true,
        embassy_id: true,
        first_name: true,
        last_name: true,
        email: true,
      },
    });
  }

  // Status management
  async activate(id: string) {
    return this.update(id, { staff_status: 'active' });
  }

  async deactivate(id: string) {
    return this.update(id, { staff_status: 'inactive' });
  }

  async setOnLeave(id: string) {
    return this.update(id, { staff_status: 'on_leave' });
  }

  async retire(id: string) {
    return this.update(id, { staff_status: 'retired' });
  }

  // Transfer management
  async transferStaff(id: string, embassy_id: string, reason?: string) {
    return this.update(id, {
      embassy_id,
      is_transferred: true,
      transfer_date: new Date().toISOString(),
      transfer_reason: reason,
    });
  }

  // Statistics
  async getStats(embassy_id?: string) {
    const where: any = {};

    if (embassy_id !== undefined) {
      where.embassy_id = embassy_id;
    }

    const [
      total,
      active,
      inactive,
      onLeave,
      retired,
      transferred,
      byGenderResults,
      byDepartmentResults,
    ] = await Promise.all([
      this.prisma.staff.count({ where }),
      this.prisma.staff.count({ where: { ...where, staff_status: 'active' } }),
      this.prisma.staff.count({
        where: { ...where, staff_status: 'inactive' },
      }),
      this.prisma.staff.count({
        where: { ...where, staff_status: 'on_leave' },
      }),
      this.prisma.staff.count({ where: { ...where, staff_status: 'retired' } }),
      this.prisma.staff.count({ where: { ...where, is_transferred: true } }),
      this.prisma.staff.groupBy({
        by: ['gender'],
        where,
        _count: true,
      }),
      this.prisma.staff.groupBy({
        by: ['department'],
        where,
        _count: true,
      }),
    ]);

    const byGender: Record<string, number> = {};
    byGenderResults.forEach((result) => {
      if (result.gender) {
        byGender[result.gender] = result._count;
      }
    });

    const byDepartment: Record<string, number> = {};
    byDepartmentResults.forEach((result) => {
      if (result.department) {
        byDepartment[result.department] = result._count;
      }
    });

    return {
      total,
      byStatus: {
        active,
        inactive,
        onLeave,
        retired,
      },
      byGender,
      byDepartment,
      transferred,
    };
  }
}
