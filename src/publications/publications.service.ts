import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreatePublicationDto,
  UpdatePublicationDto,
  QueryPublicationsDto,
} from './export-publications';
import { randomUUID } from 'crypto';

@Injectable()
export class PublicationsService {
  private publications: Array<
    CreatePublicationDto & { id: string; created_at: Date; updated_at: Date }
  > = [
    {
      id: randomUUID(),
      title: 'Advancements in Renewable Energy Technologies',
      slug: 'advancements-in-renewable-energy-technologies',
      publication_type: 'research_paper',
      content:
        'This publication explores the latest advancements in renewable energy technologies...',
      tags: ['renewable energy', 'sustainability', 'technology'],
      status: 'published',
      created_by: 1,
      embassy_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  findAll(queryParams?: QueryPublicationsDto) {
    let filtered = this.publications;

    if (queryParams) {
      if (queryParams.embassy_id !== undefined) {
        filtered = filtered.filter(
          (pub) => pub.embassy_id === queryParams.embassy_id,
        );
      }

      if (queryParams.status !== undefined) {
        filtered = filtered.filter((pub) => pub.status === queryParams.status);
      }

      if (queryParams.publication_type !== undefined) {
        filtered = filtered.filter(
          (pub) => pub.publication_type === queryParams.publication_type,
        );
      }
    }

    const page = Number(queryParams?.page) || 1;
    const limit = Number(queryParams?.limit) || 25;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const paginatedPublications = filtered.slice(skip, skip + limit);

    return {
      data: paginatedPublications,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  findOne(id: string) {
    const publication = this.publications.find((pub) => pub.id === id);
    if (!publication) {
      throw new NotFoundException(`Publication with ID ${id} not found`);
    }
    return publication;
  }

  findBySlug(slug: string) {
    const publication = this.publications.find((pub) => pub.slug === slug);
    if (!publication) {
      throw new NotFoundException(`Publication with slug ${slug} not found`);
    }
    return publication;
  }

  create(createPublicationDto: CreatePublicationDto) {
    const newPublication = {
      id: randomUUID(),
      ...createPublicationDto,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.publications.push(newPublication);
    return newPublication;
  }

  update(id: string, updatePublicationDto: Partial<UpdatePublicationDto>) {
    const pubIndex = this.publications.findIndex((pub) => pub.id === id);
    if (pubIndex === -1) {
      throw new NotFoundException(`Publication with ID ${id} not found`);
    }

    const updatedPublication = {
      ...this.publications[pubIndex],
      ...updatePublicationDto,
      updated_at: new Date(),
    };

    this.publications[pubIndex] = updatedPublication;
    return updatedPublication;
  }

  remove(id: string) {
    const pubIndex = this.publications.findIndex((pub) => pub.id === id);
    if (pubIndex === -1) {
      throw new NotFoundException(`Publication with ID ${id} not found`);
    }
    const deletedPublication = this.publications[pubIndex];
    this.publications.splice(pubIndex, 1);
    return deletedPublication;
  }

  publish(id: string) {
    return this.update(id, { status: 'published' });
  }

  archive(id: string) {
    return this.update(id, { status: 'archived' });
  }

  draft(id: string) {
    return this.update(id, { status: 'draft' });
  }

  getStats(embassy_id?: number) {
    let publications = this.publications;

    if (embassy_id !== undefined) {
      publications = publications.filter(
        (pub) => pub.embassy_id === embassy_id,
      );
    }

    const total = publications.length;
    const published = publications.filter(
      (pub) => pub.status === 'published',
    ).length;
    const draft = publications.filter((pub) => pub.status === 'draft').length;
    const archived = publications.filter(
      (pub) => pub.status === 'archived',
    ).length;

    const byType: Record<string, number> = {};
    publications.forEach((pub) => {
      byType[pub.publication_type] = (byType[pub.publication_type] || 0) + 1;
    });

    return {
      total,
      published,
      draft,
      archived,
      byType,
    };
  }
}
