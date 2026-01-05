import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmbassyDto, UpdateEmbassyDto } from './export-embassy';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmbassyService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.embassy.findMany({
      select: {
        id: true,
        name: true,
        country: true,
        city: true,
        address: true,
        phone: true,
        email: true,
        embassy_picture: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const embassy = await this.prisma.embassy.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        country: true,
        city: true,
        address: true,
        phone: true,
        email: true,
        embassy_picture: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!embassy) {
      throw new NotFoundException(`Embassy with id ${id} not found`);
    }
    return embassy;
  }

  async createEmbassy(createEmbassyDto: CreateEmbassyDto) {
    const embassy = await this.prisma.embassy.create({
      data: {
        name: createEmbassyDto.name,
        country: createEmbassyDto.country,
        city: createEmbassyDto.city,
        address: createEmbassyDto.address,
        phone: createEmbassyDto.phone_number,
        email: createEmbassyDto.email,
        embassy_picture: createEmbassyDto.embassy_picture,
      },
      select: {
        id: true,
        name: true,
        country: true,
        city: true,
        address: true,
        phone: true,
        email: true,
        embassy_picture: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    return embassy;
  }

  async updateEmbassy(id: string, updateEmbassyDto: UpdateEmbassyDto) {
    // Check if embassy exists
    await this.findOne(id);

    const dataToUpdate: any = {};

    if (updateEmbassyDto.name !== undefined) {
      dataToUpdate.name = updateEmbassyDto.name;
    }
    if (updateEmbassyDto.country !== undefined) {
      dataToUpdate.country = updateEmbassyDto.country;
    }
    if (updateEmbassyDto.city !== undefined) {
      dataToUpdate.city = updateEmbassyDto.city;
    }
    if (updateEmbassyDto.address !== undefined) {
      dataToUpdate.address = updateEmbassyDto.address;
    }
    if (updateEmbassyDto.phone_number !== undefined) {
      dataToUpdate.phone = updateEmbassyDto.phone_number;
    }
    if (updateEmbassyDto.email !== undefined) {
      dataToUpdate.email = updateEmbassyDto.email;
    }
    if (updateEmbassyDto.embassy_picture !== undefined) {
      dataToUpdate.embassy_picture = updateEmbassyDto.embassy_picture;
    }

    const embassy = await this.prisma.embassy.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        country: true,
        city: true,
        address: true,
        phone: true,
        email: true,
        embassy_picture: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    return embassy;
  }

  async removeEmbassy(id: string) {
    // Check if embassy exists
    await this.findOne(id);

    await this.prisma.embassy.delete({
      where: { id },
    });

    return { message: `Embassy with id ${id} has been removed` };
  }
}
