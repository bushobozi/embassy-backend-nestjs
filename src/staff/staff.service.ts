import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStaffDto, UpdateStaffDto, QueryStaffDto } from './export-staff';
import { randomUUID } from 'crypto';

@Injectable()
export class StaffService {
  private staff: Array<
    CreateStaffDto & { id: string; created_at: Date; updated_at: Date }
  > = [
    {
      id: randomUUID(),
      first_name: 'John',
      middle_name: 'A.',
      last_name: 'Doe',
      gender: 'male',
      date_of_birth: new Date('1990-05-15'),
      position: 'Software Engineer',
      department: 'IT Department',
      email: 'john.doe@example.com',
      phone_number: '+1234567890',
      address: '123 Main St, Springfield',
      city: 'Springfield',
      country: 'USA',
      languages_spoken: 'English, Spanish',
      skills: 'Project Management, Software Development',
      hired_date: new Date('2024-01-10'),
      academic_qualifications: 'MBA',
      professional_qualifications: 'PMP',
      emergency_contact_name: 'Jane Doe',
      emergency_contact_relationship: 'Sister',
      emergency_contact_phone: '+0987654321',
      next_of_kin_name: 'Jim Doe',
      next_of_kin_relationship: 'Brother',
      next_of_kin_phone: '+1122334455',
      religion: 'Christianity',
      marital_status: 'single',
      id_type: 'passport',
      id_number: 'A12345678',
      id_issue_date: new Date('2020-01-01'),
      id_expiry_date: new Date('2030-01-01'),
      nationality: 'USA',
      staff_status: 'active',
      is_transferred: false,
      embassy_id: '1234567890abcdef',
      created_by: '1',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  findAll(queryParams?: QueryStaffDto) {
    let filtered = this.staff;

    if (queryParams) {
      if (queryParams.embassy_id !== undefined) {
        filtered = filtered.filter(
          (staff) => staff.embassy_id === queryParams.embassy_id,
        );
      }

      if (queryParams.gender !== undefined) {
        filtered = filtered.filter(
          (staff) => staff.gender === queryParams.gender,
        );
      }

      if (queryParams.religion !== undefined) {
        filtered = filtered.filter(
          (staff) => staff.religion === queryParams.religion,
        );
      }

      if (queryParams.marital_status !== undefined) {
        filtered = filtered.filter(
          (staff) => staff.marital_status === queryParams.marital_status,
        );
      }

      if (queryParams.staff_status !== undefined) {
        filtered = filtered.filter(
          (staff) => staff.staff_status === queryParams.staff_status,
        );
      }

      if (queryParams.country !== undefined) {
        filtered = filtered.filter(
          (staff) => staff.country === queryParams.country,
        );
      }

      if (queryParams.nationality !== undefined) {
        filtered = filtered.filter(
          (staff) => staff.nationality === queryParams.nationality,
        );
      }

      if (queryParams.department !== undefined) {
        filtered = filtered.filter(
          (staff) => staff.department === queryParams.department,
        );
      }

      if (queryParams.position !== undefined) {
        filtered = filtered.filter(
          (staff) => staff.position === queryParams.position,
        );
      }
    }

    const page = Number(queryParams?.page) || 1;
    const limit = Number(queryParams?.limit) || 25;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const paginatedStaff = filtered.slice(skip, skip + limit);

    return {
      data: paginatedStaff,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  findOne(id: string) {
    const staff = this.staff.find((staff) => staff.id === id);
    if (!staff) {
      throw new NotFoundException(`Staff member with ID ${id} not found`);
    }
    return staff;
  }

  create(createStaffDto: CreateStaffDto) {
    const newStaff = {
      id: randomUUID(),
      ...createStaffDto,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.staff.push(newStaff);
    return newStaff;
  }

  update(id: string, updateStaffDto: Partial<UpdateStaffDto>) {
    const staffIndex = this.staff.findIndex((staff) => staff.id === id);
    if (staffIndex === -1) {
      throw new NotFoundException(`Staff member with ID ${id} not found`);
    }

    const updatedStaff = {
      ...this.staff[staffIndex],
      ...updateStaffDto,
      updated_at: new Date(),
    };

    this.staff[staffIndex] = updatedStaff;
    return updatedStaff;
  }

  remove(id: string) {
    const staffIndex = this.staff.findIndex((staff) => staff.id === id);
    if (staffIndex === -1) {
      throw new NotFoundException(`Staff member with ID ${id} not found`);
    }
    const deletedStaff = this.staff[staffIndex];
    this.staff.splice(staffIndex, 1);
    return deletedStaff;
  }

  // Status management
  activate(id: string) {
    return this.update(id, { staff_status: 'active' });
  }

  deactivate(id: string) {
    return this.update(id, { staff_status: 'inactive' });
  }

  setOnLeave(id: string) {
    return this.update(id, { staff_status: 'on_leave' });
  }

  retire(id: string) {
    return this.update(id, { staff_status: 'retired' });
  }

  // Transfer management
  transferStaff(id: string, embassy_id: string, reason?: string) {
    return this.update(id, {
      embassy_id,
      is_transferred: true,
      transfer_date: new Date(),
      transfer_reason: reason,
    });
  }

  // Statistics
  getStats(embassy_id?: string) {
    let staff = this.staff;

    if (embassy_id !== undefined) {
      staff = staff.filter((s) => s.embassy_id === embassy_id);
    }

    const total = staff.length;
    const active = staff.filter((s) => s.staff_status === 'active').length;
    const inactive = staff.filter((s) => s.staff_status === 'inactive').length;
    const onLeave = staff.filter((s) => s.staff_status === 'on_leave').length;
    const retired = staff.filter((s) => s.staff_status === 'retired').length;

    const byGender: Record<string, number> = {};
    staff.forEach((s) => {
      byGender[s.gender] = (byGender[s.gender] || 0) + 1;
    });

    const byDepartment: Record<string, number> = {};
    staff.forEach((s) => {
      byDepartment[s.department] = (byDepartment[s.department] || 0) + 1;
    });

    const transferred = staff.filter((s) => s.is_transferred).length;

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
