import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './export-users';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        staff_profile: {
          select: {
            embassy_id: true,
          },
        },
      },
    });

    // Map to include embassy_id from staff profile
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      embassy_id: user.staff_profile?.embassy_id || null,
    }));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        staff_profile: {
          select: {
            embassy_id: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      embassy_id: user.staff_profile?.embassy_id || null,
    };
  }

  async create(createUserDto: CreateUserDto) {
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Only map fields that exist in the User schema
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        role: createUserDto.role || 'user',
        is_active: createUserDto.is_active ?? true,
      },
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
    });

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        staff_profile: {
          select: {
            embassy_id: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      embassy_id: user.staff_profile?.embassy_id || null,
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
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        staff_profile: {
          select: {
            embassy_id: true,
          },
        },
      },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      embassy_id: user.staff_profile?.embassy_id || null,
    }));
  }

  async findActive() {
    const users = await this.prisma.user.findMany({
      where: { is_active: true },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        staff_profile: {
          select: {
            embassy_id: true,
          },
        },
      },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      embassy_id: user.staff_profile?.embassy_id || null,
    }));
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
    // Check if user exists
    await this.findOne(id);

    // Only map fields that exist in the User schema
    const dataToUpdate: any = {};

    if (updateUserDto.email !== undefined) {
      dataToUpdate.email = updateUserDto.email;
    }
    if (updateUserDto.first_name !== undefined) {
      dataToUpdate.first_name = updateUserDto.first_name;
    }
    if (updateUserDto.last_name !== undefined) {
      dataToUpdate.last_name = updateUserDto.last_name;
    }
    if (updateUserDto.role !== undefined) {
      dataToUpdate.role = updateUserDto.role;
    }
    if (updateUserDto.is_active !== undefined) {
      dataToUpdate.is_active = updateUserDto.is_active;
    }
    if (updateUserDto.password !== undefined) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
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
    });

    return user;
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
