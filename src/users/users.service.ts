import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './export-users';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  private users: Array<
    CreateUserDto & { id: string; created_at: Date; updated_at: Date }
  > = [
    {
      id: randomUUID(),
      first_name: 'John',
      middle_name: 'A.',
      last_name: 'Doe',
      email: 'sdfds@email.com',
      password: 'strongPassword123!',
      role: 'admin',
      is_active: true,
      phone_number: '+1234567890',
      address: '123 Main St, Anytown, USA',
      date_of_birth: new Date('1990-01-01'),
      work_phone_number: '+0987654321',
      work_email: 'john.doe@embassy.com',
      emergency_contact_name: 'Jane Doe',
      emergency_contact_phone_number: '+0987654321',
      emergency_contact_relationship: 'Spouse',
      department: 'IT',
      position: 'Developer',
      hire_date: new Date('2020-06-15'),
      biography: 'Experienced developer with expertise in NestJS',
      profile_picture: 'https://example.com/profiles/johndoe.jpg',
      languages: ['English', 'Spanish'],
      certifications: ['AWS Certified Developer'],
      social_media_links: {
        linkedin: 'https://linkedin.com/in/johndoe',
        twitter: '@johndoe',
      },
      previous_employers: ['Tech Corp', 'Innovation Inc'],
      education: ['BS in Computer Science - MIT'],
      embassy_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
  findAll() {
    return this.users;
  }
  findOne(id: string) {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
  create(createUserDto: CreateUserDto) {
    const newUser = {
      id: randomUUID(),
      ...createUserDto,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }
  findByEmail(email: string) {
    const user = this.users.find((user) => user.email === email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }
  findByEmbassy(embassyId: number) {
    return this.users.filter((user) => user.embassy_id === embassyId);
  }
  findByRole(role: string) {
    return this.users.filter((user) => user.role === role);
  }
  findActive() {
    return this.users.filter((user) => user.is_active);
  }
  findByDepartment(department: string) {
    return this.users.filter((user) => user.department === department);
  }
  update(id: string, updateUserDto: UpdateUserDto) {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...updateUserDto,
      updated_at: new Date(),
    };

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }
  remove(id: string) {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const deletedUser = this.users[userIndex];
    this.users.splice(userIndex, 1);
    return deletedUser;
  }
  deactivate(id: string) {
    return this.update(id, { is_active: false });
  }
  activate(id: string) {
    return this.update(id, { is_active: true });
  }
  getStats() {
    const total = this.users.length;
    const active = this.users.filter((user) => user.is_active).length;
    const inactive = total - active;
    const byRole = this.users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total,
      active,
      inactive,
      byRole,
    };
  }
}
