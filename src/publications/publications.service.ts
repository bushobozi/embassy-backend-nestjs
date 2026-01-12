import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreatePublicationDto,
  UpdatePublicationDto,
  QueryPublicationsDto,
} from './export-publications';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

// Type for Event with Embassy relation
type PublicationWithEmbassy = Prisma.PublicationGetPayload<{
  include: {
    embassy: {
      select: {
        name: true;
        embassy_picture: true;
      };
    };
  };
}>;

@Injectable()
export class PublicationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(queryParams?: QueryPublicationsDto) {
    const where: {
      embassy_id?: string;
      status?: string;
      publication_type?: string;
    } = {};

    if (queryParams) {
      if (queryParams.embassy_id !== undefined) {
        where.embassy_id = queryParams.embassy_id;
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
        include: {
          embassy: {
            select: {
              name: true,
              embassy_picture: true,
            },
          },
        },
      }),
      this.prisma.publication.count({ where }),
    ]);

    const mappedPublications = publications.map(
      (publication: PublicationWithEmbassy) => ({
        ...publication,
        embassy_name: publication.embassy?.name,
        embassy_picture: publication.embassy?.embassy_picture,
      }),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: mappedPublications,
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
        slug: true,
        cover_image: true,
        attachments: true,
        tags: true,
        publication_type: true,
        status: true,
        published_at: true,
        created_by: true,
        created_at: true,
        updated_at: true,
        embassy: {
          select: {
            name: true,
            embassy_picture: true,
          },
        },
      },
    });

    if (!publication) {
      throw new NotFoundException(`Publication with ID ${id} not found`);
    }

    return {
      ...publication,
      embassy_name: publication.embassy?.name,
      embassy_picture: publication.embassy?.embassy_picture,
    };
  }

  async findBySlug(slug: string) {
    const publication = await this.prisma.publication.findFirst({
      where: { title: slug },
      select: {
        id: true,
        embassy_id: true,
        title: true,
        content: true,
        slug: true,
        cover_image: true,
        attachments: true,
        tags: true,
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
        embassy_id: embassy_id,
        created_by,
        published_at:
          createPublicationDto.status === 'published' ? new Date() : null,
      },
      select: {
        id: true,
        embassy_id: true,
        title: true,
        content: true,
        slug: true,
        cover_image: true,
        attachments: true,
        tags: true,
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

  async update(
    id: string,
    updatePublicationDto: Partial<UpdatePublicationDto>,
  ) {
    // Check if publication exists
    await this.findOne(id);

    const dataToUpdate: Partial<UpdatePublicationDto> & {
      embassy_id?: string;
      created_by?: string;
      published_at?: Date | null;
    } = { ...updatePublicationDto };

    if (updatePublicationDto.embassy_id !== undefined) {
      dataToUpdate.embassy_id = updatePublicationDto.embassy_id;
    }

    if (updatePublicationDto.created_by !== undefined) {
      dataToUpdate.created_by = updatePublicationDto.created_by;
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
        slug: true,
        cover_image: true,
        attachments: true,
        tags: true,
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

  async getStats(embassy_id?: string) {
    const where: {
      embassy_id?: string;
      status?: string;
    } = {};

    if (embassy_id !== undefined) {
      where.embassy_id = embassy_id;
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
