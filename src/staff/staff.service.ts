import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStaffDto, UpdateStaffDto, QueryStaffDto } from './export-staff';
import { PrismaService } from '../prisma/prisma.service';

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
          last_name: true,
          email: true,
          phone: true,
          position: true,
          department: true,
          gender: true,
          religion: true,
          marital_status: true,
          country: true,
          nationality: true,
          staff_status: true,
          hire_date: true,
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
        last_name: true,
        email: true,
        phone: true,
        position: true,
        department: true,
        gender: true,
        religion: true,
        marital_status: true,
        country: true,
        nationality: true,
        staff_status: true,
        hire_date: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!staff) {
      throw new NotFoundException(`Staff member with ID ${id} not found`);
    }
    return staff;
  }

  async create(createStaffDto: CreateStaffDto, user_id: string) {
    // Map DTO fields to schema fields
    // Note: The DTO has many extra fields that aren't in the schema
    // We only use fields that exist in the Staff model
    const staff = await this.prisma.staff.create({
      data: {
        user_id,
        embassy_id: createStaffDto.embassy_id,
        first_name: createStaffDto.first_name,
        last_name: createStaffDto.last_name,
        email: createStaffDto.email,
        phone: createStaffDto.phone_number,
        position: createStaffDto.position,
        department: createStaffDto.department,
        gender: createStaffDto.gender,
        religion: createStaffDto.religion,
        marital_status: createStaffDto.marital_status,
        country: createStaffDto.country,
        nationality: createStaffDto.nationality,
        staff_status: createStaffDto.staff_status || 'active',
        hire_date: createStaffDto.hired_date
          ? new Date(createStaffDto.hired_date)
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
        nationality: true,
        staff_status: true,
        hire_date: true,
        created_at: true,
        updated_at: true,
      },
    });

    return staff;
  }

  async update(id: string, updateStaffDto: Partial<UpdateStaffDto>) {
    // Check if staff exists
    await this.findOne(id);

    // Map DTO fields to schema fields
    const dataToUpdate: any = {};

    if (updateStaffDto.first_name !== undefined) {
      dataToUpdate.first_name = updateStaffDto.first_name;
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
    if (updateStaffDto.nationality !== undefined) {
      dataToUpdate.nationality = updateStaffDto.nationality;
    }
    if (updateStaffDto.staff_status !== undefined) {
      dataToUpdate.staff_status = updateStaffDto.staff_status;
    }
    if (updateStaffDto.hired_date !== undefined) {
      dataToUpdate.hire_date = updateStaffDto.hired_date
        ? new Date(updateStaffDto.hired_date)
        : null;
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
        last_name: true,
        email: true,
        phone: true,
        position: true,
        department: true,
        gender: true,
        religion: true,
        marital_status: true,
        country: true,
        nationality: true,
        staff_status: true,
        hire_date: true,
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
    // Note: The schema doesn't have is_transferred, transfer_date, or transfer_reason fields
    // We'll just update the embassy_id for now
    return this.update(id, {
      embassy_id,
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
      transferred: 0, // Schema doesn't have is_transferred field
    };
  }
}
