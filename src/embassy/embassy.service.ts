import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmbassyDto, UpdateEmbassyDto } from './export-embassy';
import { randomUUID } from 'crypto';
@Injectable()
export class EmbassyService {
  private embassies = [
    {
      id: randomUUID(),
      name: 'US Embassy',
      country: 'United States',
      city: 'Washington D.C.',
      address: '2201 C St NW, Washington, DC 20037',
      phone_number: '+1 202-647-4000',
    },
  ];
  findAll() {
    return this.embassies;
  }
  findOne(id: string) {
    const matchingEmbassy = this.embassies.find((embassy) => embassy.id === id);
    if (!matchingEmbassy) {
      throw new NotFoundException(`Embassy with id ${id} not found`);
    }
    return matchingEmbassy;
  }
  createEmbassy(createEmbassyDto: CreateEmbassyDto) {
    const createdEmbassy = {
      id: randomUUID(),
      ...createEmbassyDto,
    };
    this.embassies.push(createdEmbassy);
    return createdEmbassy;
  }
  updateEmbassy(id: string, updateEmbassyDto: UpdateEmbassyDto) {
    const matchingEmbassy = this.embassies.find(
      (existingEmbassy) => existingEmbassy.id === id,
    );
    if (!matchingEmbassy) {
      throw new NotFoundException(`Embassy with id ${id} not found`);
    }
    matchingEmbassy.name = updateEmbassyDto.name;
    matchingEmbassy.country = updateEmbassyDto.country;
    matchingEmbassy.city = updateEmbassyDto.city;
    matchingEmbassy.address = updateEmbassyDto.address;
    matchingEmbassy.phone_number = updateEmbassyDto.phone_number;
    return matchingEmbassy;
  }
  removeEmbassy(id: string) {
    const embassyIndex = this.embassies.findIndex(
      (existingEmbassy) => existingEmbassy.id === id,
    );
    if (embassyIndex === -1) {
      throw new NotFoundException(`Embassy with id ${id} not found`);
    }
    this.embassies.splice(embassyIndex, 1);
    return { message: `Embassy with id ${id} has been removed` };
  }
}
