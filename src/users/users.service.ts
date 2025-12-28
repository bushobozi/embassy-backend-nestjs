import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './export-users';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Reusable select object for all user fields
  private readonly userSelect = {
    id: true,
    email: true,
    first_name: true,
    middle_name: true,
    last_name: true,
    role: true,
    is_active: true,
    phone_number: true,
    work_phone_number: true,
    work_email: true,
    address: true,
    date_of_birth: true,
    biography: true,
    emergency_contact_name: true,
    emergency_contact_phone_number: true,
    emergency_contact_relationship: true,
    department: true,
    position: true,
    hire_date: true,
    profile_picture: true,
    languages: true,
    certifications: true,
    previous_employers: true,
    education: true,
    social_media_links: true,
    created_at: true,
    updated_at: true,
    staff_profile: {
      select: {
        embassy_id: true,
      },
    },
  };

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: this.userSelect,
    });

    // Map to include embassy_id from staff profile
    return users.map((user) => {
      const { staff_profile, ...userData } = user;
      return {
        ...userData,
        embassy_id: (staff_profile?.embassy_id as string) || null,
      };
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { staff_profile, ...userData } = user;
    return {
      ...userData,
      embassy_id: (staff_profile?.embassy_id as string) || null,
    };
  }

  async create(createUserDto: CreateUserDto) {
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Map all fields from DTO to schema
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        first_name: createUserDto.first_name,
        middle_name: createUserDto.middle_name,
        last_name: createUserDto.last_name,
        role: createUserDto.role || 'user',
        is_active: createUserDto.is_active ?? true,
        phone_number: createUserDto.phone_number,
        work_phone_number: createUserDto.work_phone_number,
        work_email: createUserDto.work_email,
        address: createUserDto.address,
        date_of_birth: createUserDto.date_of_birth
          ? createUserDto.date_of_birth.toString()
          : null,
        biography: createUserDto.biography,
        emergency_contact_name: createUserDto.emergency_contact_name,
        emergency_contact_phone_number:
          createUserDto.emergency_contact_phone_number,
        emergency_contact_relationship:
          createUserDto.emergency_contact_relationship,
        department: createUserDto.department,
        position: createUserDto.position,
        hire_date: createUserDto.hire_date
          ? new Date(createUserDto.hire_date)
          : null,
        profile_picture: createUserDto.profile_picture,
        languages: createUserDto.languages || [],
        certifications: createUserDto.certifications || [],
        previous_employers: createUserDto.previous_employers || [],
        education: createUserDto.education || [],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        social_media_links: createUserDto.social_media_links
          ? (createUserDto.social_media_links as any)
          : undefined,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        middle_name: true,
        last_name: true,
        role: true,
        is_active: true,
        phone_number: true,
        work_phone_number: true,
        work_email: true,
        address: true,
        date_of_birth: true,
        biography: true,
        emergency_contact_name: true,
        emergency_contact_phone_number: true,
        emergency_contact_relationship: true,
        department: true,
        position: true,
        hire_date: true,
        profile_picture: true,
        languages: true,
        certifications: true,
        previous_employers: true,
        education: true,
        social_media_links: true,
        created_at: true,
        updated_at: true,
      },
    });

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: this.userSelect,
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    const { staff_profile, ...userData } = user;
    return {
      ...userData,
      embassy_id: (staff_profile?.embassy_id as string) || null,
    };
  }

  async findByEmbassy(embassyId: string) {
    // Find staff members for this embassy, then get their users
    const staff = await this.prisma.staff.findMany({
      where: {
        embassy_id: embassyId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true,
            is_active: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    });

    return staff.map((s) => ({
      ...s.user,
      embassy_id: s.embassy_id,
    }));
  }

  async findByRole(role: string) {
    const users = await this.prisma.user.findMany({
      where: { role },
      select: this.userSelect,
    });

    return users.map((user) => {
      const { staff_profile, ...userData } = user;
      return {
        ...userData,
        embassy_id: (staff_profile?.embassy_id as string) || null,
      };
    });
  }

  async findActive() {
    const users = await this.prisma.user.findMany({
      where: { is_active: true },
      select: this.userSelect,
    });

    return users.map((user) => {
      const { staff_profile, ...userData } = user;
      return {
        ...userData,
        embassy_id: (staff_profile?.embassy_id as string) || null,
      };
    });
  }

  async findByDepartment(department: string) {
    // Find staff members in this department, then get their users
    const staff = await this.prisma.staff.findMany({
      where: {
        department,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true,
            is_active: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    });

    return staff.map((s) => ({
      ...s.user,
      embassy_id: s.embassy_id,
    }));
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    const dataToUpdate: Partial<CreateUserDto> = {};

    // Map all updatable fields
    if (updateUserDto.email !== undefined)
      dataToUpdate.email = updateUserDto.email;
    if (updateUserDto.first_name !== undefined)
      dataToUpdate.first_name = updateUserDto.first_name;
    if (updateUserDto.middle_name !== undefined)
      dataToUpdate.middle_name = updateUserDto.middle_name;
    if (updateUserDto.last_name !== undefined)
      dataToUpdate.last_name = updateUserDto.last_name;
    if (updateUserDto.role !== undefined)
      dataToUpdate.role = updateUserDto.role;
    if (updateUserDto.is_active !== undefined)
      dataToUpdate.is_active = updateUserDto.is_active;
    if (updateUserDto.phone_number !== undefined)
      dataToUpdate.phone_number = updateUserDto.phone_number;
    if (updateUserDto.work_phone_number !== undefined)
      dataToUpdate.work_phone_number = updateUserDto.work_phone_number;
    if (updateUserDto.work_email !== undefined)
      dataToUpdate.work_email = updateUserDto.work_email;
    if (updateUserDto.address !== undefined)
      dataToUpdate.address = updateUserDto.address;
    if (updateUserDto.date_of_birth !== undefined)
      dataToUpdate.date_of_birth = new Date(updateUserDto.date_of_birth);
    if (updateUserDto.biography !== undefined)
      dataToUpdate.biography = updateUserDto.biography;
    if (updateUserDto.emergency_contact_name !== undefined)
      dataToUpdate.emergency_contact_name =
        updateUserDto.emergency_contact_name;
    if (updateUserDto.emergency_contact_phone_number !== undefined)
      dataToUpdate.emergency_contact_phone_number =
        updateUserDto.emergency_contact_phone_number;
    if (updateUserDto.emergency_contact_relationship !== undefined)
      dataToUpdate.emergency_contact_relationship =
        updateUserDto.emergency_contact_relationship;
    if (updateUserDto.department !== undefined)
      dataToUpdate.department = updateUserDto.department;
    if (updateUserDto.position !== undefined)
      dataToUpdate.position = updateUserDto.position;
    if (updateUserDto.hire_date !== undefined)
      dataToUpdate.hire_date = new Date(updateUserDto.hire_date);
    if (updateUserDto.profile_picture !== undefined)
      dataToUpdate.profile_picture = updateUserDto.profile_picture;
    if (updateUserDto.languages !== undefined)
      dataToUpdate.languages = updateUserDto.languages;
    if (updateUserDto.certifications !== undefined)
      dataToUpdate.certifications = updateUserDto.certifications;
    if (updateUserDto.previous_employers !== undefined)
      dataToUpdate.previous_employers = updateUserDto.previous_employers;
    if (updateUserDto.education !== undefined)
      dataToUpdate.education = updateUserDto.education;
    if (updateUserDto.social_media_links !== undefined)
      dataToUpdate.social_media_links = updateUserDto.social_media_links;
    if (updateUserDto.password !== undefined) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: this.userSelect,
    });

    const { staff_profile, ...userData } = user;
    return {
      ...userData,
      embassy_id: (staff_profile?.embassy_id as string) || null,
    };
  }

  async remove(id: string) {
    // Check if user exists
    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
      },
    });
  }

  async deactivate(id: string) {
    return this.update(id, { is_active: false });
  }

  async activate(id: string) {
    return this.update(id, { is_active: true });
  }

  async getStats() {
    const [total, active, byRole] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { is_active: true } }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
    ]);

    const inactive = total - active;
    const roleStats = byRole.reduce(
      (acc, item) => {
        acc[item.role] = item._count;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total,
      active,
      inactive,
      byRole: roleStats,
    };
  }
}
