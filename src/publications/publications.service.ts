import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreatePublicationDto,
  UpdatePublicationDto,
  QueryPublicationsDto,
} from './export-publications';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(queryParams?: QueryPublicationsDto) {
    const where: any = {};

    if (queryParams) {
      if (queryParams.embassy_id !== undefined) {
        where.embassy_id = queryParams.embassy_id.toString();
      }

      if (queryParams.status !== undefined) {
        where.status = queryParams.status;
      }

      if (queryParams.publication_type !== undefined) {
        where.publication_type = queryParams.publication_type;
      }
    }

    const page = Number(queryParams?.page) || 1;
    const limit = Number(queryParams?.limit) || 25;
    const skip = (page - 1) * limit;

    const [publications, total] = await Promise.all([
      this.prisma.publication.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
        select: {
          id: true,
          embassy_id: true,
          title: true,
          content: true,
          publication_type: true,
          status: true,
          published_at: true,
          created_by: true,
          created_at: true,
          updated_at: true,
        },
      }),
      this.prisma.publication.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: publications,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string) {
    const publication = await this.prisma.publication.findUnique({
      where: { id },
      select: {
        id: true,
        embassy_id: true,
        title: true,
        content: true,
        publication_type: true,
        status: true,
        published_at: true,
        created_by: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!publication) {
      throw new NotFoundException(`Publication with ID ${id} not found`);
    }
    return publication;
  }

  async findBySlug(slug: string) {
    // Note: The schema doesn't have a slug field, so we'll search by title
    // If you need slug functionality, you'll need to add it to the schema
    const publication = await this.prisma.publication.findFirst({
      where: { title: slug },
      select: {
        id: true,
        embassy_id: true,
        title: true,
        content: true,
        publication_type: true,
        status: true,
        published_at: true,
        created_by: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!publication) {
      throw new NotFoundException(`Publication with slug ${slug} not found`);
    }
    return publication;
  }

  async create(createPublicationDto: CreatePublicationDto, created_by: string) {
    const { embassy_id, ...publicationData } = createPublicationDto;

    const publication = await this.prisma.publication.create({
      data: {
        ...publicationData,
        embassy_id: embassy_id.toString(),
        created_by,
        published_at:
          createPublicationDto.status === 'published' ? new Date() : null,
      },
      select: {
        id: true,
        embassy_id: true,
        title: true,
        content: true,
        publication_type: true,
        status: true,
        published_at: true,
        created_by: true,
        created_at: true,
        updated_at: true,
      },
    });

    return publication;
  }

  async update(id: string, updatePublicationDto: Partial<UpdatePublicationDto>) {
    // Check if publication exists
    await this.findOne(id);

    const dataToUpdate: any = { ...updatePublicationDto };

    if (updatePublicationDto.embassy_id !== undefined) {
      dataToUpdate.embassy_id = updatePublicationDto.embassy_id.toString();
    }

    if (updatePublicationDto.created_by !== undefined) {
      dataToUpdate.created_by = updatePublicationDto.created_by.toString();
    }

    // Set published_at if status changes to published
    if (
      updatePublicationDto.status === 'published' &&
      !dataToUpdate.published_at
    ) {
      dataToUpdate.published_at = new Date();
    }

    const publication = await this.prisma.publication.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        embassy_id: true,
        title: true,
        content: true,
        publication_type: true,
        status: true,
        published_at: true,
        created_by: true,
        created_at: true,
        updated_at: true,
      },
    });

    return publication;
  }

  async remove(id: string) {
    // Check if publication exists
    await this.findOne(id);

    return this.prisma.publication.delete({
      where: { id },
      select: {
        id: true,
        embassy_id: true,
        title: true,
        content: true,
        publication_type: true,
        status: true,
      },
    });
  }

  async publish(id: string) {
    return this.update(id, { status: 'published' });
  }

  async archive(id: string) {
    return this.update(id, { status: 'archived' });
  }

  async draft(id: string) {
    return this.update(id, { status: 'draft' });
  }

  async getStats(embassy_id?: number) {
    const where: any = {};

    if (embassy_id !== undefined) {
      where.embassy_id = embassy_id.toString();
    }

    const [total, published, draft, archived, byTypeResults] =
      await Promise.all([
        this.prisma.publication.count({ where }),
        this.prisma.publication.count({
          where: { ...where, status: 'published' },
        }),
        this.prisma.publication.count({ where: { ...where, status: 'draft' } }),
        this.prisma.publication.count({
          where: { ...where, status: 'archived' },
        }),
        this.prisma.publication.groupBy({
          by: ['publication_type'],
          where,
          _count: true,
        }),
      ]);

    const byType: Record<string, number> = {};
    byTypeResults.forEach((result) => {
      if (result.publication_type) {
        byType[result.publication_type] = result._count;
      }
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
