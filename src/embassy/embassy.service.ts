import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmbassyDto, UpdateEmbassyDto } from './export-embassy';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmbassyService {
  constructor(private prisma: PrismaService) {}

  private async generateEmbassyCode(): Promise<string> {
    // Get the count of existing embassies
    const count = await this.prisma.embassy.count();
    // Generate code as EMCON + 5-digit number (padded with zeros)
    const number = (count + 1).toString().padStart(5, '0');
    return `EMCON${number}`;
  }

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
        code: true,
        postal_code: true,
        fax_code: true,
        establishment_date: true,
        embassy_picture: true,
        is_active: true,
        provides_visa_services: true,
        provides_passport_services: true,
        provides_consular_assistance: true,
        provides_cultural_exchanges: true,
        facebook_link: true,
        twitter_link: true,
        instagram_link: true,
        linkedin_link: true,
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
        code: true,
        postal_code: true,
        fax_code: true,
        establishment_date: true,
        embassy_picture: true,
        is_active: true,
        provides_visa_services: true,
        provides_passport_services: true,
        provides_consular_assistance: true,
        provides_cultural_exchanges: true,
        facebook_link: true,
        twitter_link: true,
        instagram_link: true,
        linkedin_link: true,
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
    // Auto-generate embassy code if not provided
    const embassyCode =
      createEmbassyDto.code || (await this.generateEmbassyCode());

    const embassy = await this.prisma.embassy.create({
      data: {
        name: createEmbassyDto.name,
        country: createEmbassyDto.country,
        city: createEmbassyDto.city,
        address: createEmbassyDto.address ?? null,
        phone: createEmbassyDto.phone_number ?? null,
        email: createEmbassyDto.email ?? null,
        code: embassyCode,
        postal_code: createEmbassyDto.postal_code ?? null,
        fax_code: createEmbassyDto.fax_code ?? null,
        establishment_date: createEmbassyDto.establishment_date ?? null,
        embassy_picture: createEmbassyDto.embassy_picture ?? null,
        provides_visa_services:
          createEmbassyDto.provides_visa_services ?? false,
        provides_passport_services:
          createEmbassyDto.provides_passport_services ?? false,
        provides_consular_assistance:
          createEmbassyDto.provides_consular_assistance ?? false,
        provides_cultural_exchanges:
          createEmbassyDto.provides_cultural_exchanges ?? false,
        facebook_link: createEmbassyDto.facebook_link ?? null,
        twitter_link: createEmbassyDto.twitter_link ?? null,
        instagram_link: createEmbassyDto.instagram_link ?? null,
        linkedin_link: createEmbassyDto.linkedin_link ?? null,
      },
      select: {
        id: true,
        name: true,
        country: true,
        city: true,
        address: true,
        phone: true,
        email: true,
        code: true,
        postal_code: true,
        fax_code: true,
        establishment_date: true,
        embassy_picture: true,
        is_active: true,
        provides_visa_services: true,
        provides_passport_services: true,
        provides_consular_assistance: true,
        provides_cultural_exchanges: true,
        facebook_link: true,
        twitter_link: true,
        instagram_link: true,
        linkedin_link: true,
        created_at: true,
        updated_at: true,
      },
    });

    return embassy;
  }

  async updateEmbassy(id: string, updateEmbassyDto: UpdateEmbassyDto) {
    // Check if embassy exists
    const existingEmbassy = await this.findOne(id);

    const dataToUpdate: Prisma.EmbassyUpdateInput = {};

    // Auto-generate code if it doesn't exist in the database
    if (!existingEmbassy.code && !updateEmbassyDto.code) {
      dataToUpdate.code = await this.generateEmbassyCode();
    }

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
    if (updateEmbassyDto.code !== undefined) {
      dataToUpdate.code = updateEmbassyDto.code;
    }
    if (updateEmbassyDto.postal_code !== undefined) {
      dataToUpdate.postal_code = updateEmbassyDto.postal_code;
    }
    if (updateEmbassyDto.fax_code !== undefined) {
      dataToUpdate.fax_code = updateEmbassyDto.fax_code;
    }
    if (updateEmbassyDto.establishment_date !== undefined) {
      dataToUpdate.establishment_date = updateEmbassyDto.establishment_date;
    }
    if (updateEmbassyDto.embassy_picture !== undefined) {
      dataToUpdate.embassy_picture = updateEmbassyDto.embassy_picture;
    }
    if (updateEmbassyDto.provides_visa_services !== undefined) {
      dataToUpdate.provides_visa_services =
        updateEmbassyDto.provides_visa_services;
    }
    if (updateEmbassyDto.provides_passport_services !== undefined) {
      dataToUpdate.provides_passport_services =
        updateEmbassyDto.provides_passport_services;
    }
    if (updateEmbassyDto.provides_consular_assistance !== undefined) {
      dataToUpdate.provides_consular_assistance =
        updateEmbassyDto.provides_consular_assistance;
    }
    if (updateEmbassyDto.provides_cultural_exchanges !== undefined) {
      dataToUpdate.provides_cultural_exchanges =
        updateEmbassyDto.provides_cultural_exchanges;
    }
    if (updateEmbassyDto.facebook_link !== undefined) {
      dataToUpdate.facebook_link = updateEmbassyDto.facebook_link;
    }
    if (updateEmbassyDto.twitter_link !== undefined) {
      dataToUpdate.twitter_link = updateEmbassyDto.twitter_link;
    }
    if (updateEmbassyDto.instagram_link !== undefined) {
      dataToUpdate.instagram_link = updateEmbassyDto.instagram_link;
    }
    if (updateEmbassyDto.linkedin_link !== undefined) {
      dataToUpdate.linkedin_link = updateEmbassyDto.linkedin_link;
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
        code: true,
        postal_code: true,
        fax_code: true,
        establishment_date: true,
        embassy_picture: true,
        is_active: true,
        provides_visa_services: true,
        provides_passport_services: true,
        provides_consular_assistance: true,
        provides_cultural_exchanges: true,
        facebook_link: true,
        twitter_link: true,
        instagram_link: true,
        linkedin_link: true,
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
