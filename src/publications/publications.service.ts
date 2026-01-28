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

// Simple in-memory cache with TTL
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 60000; // 60 seconds default

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl = this.defaultTTL): void {
    this.cache.set(key, { data, expiry: Date.now() + ttl });
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

@Injectable()
export class PublicationsService {
  private cache = new SimpleCache();

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

    this.cache.invalidate(); // Clear cache on create
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

    this.cache.invalidate(); // Clear cache on update
    return publication;
  }

  async remove(id: string) {
    // Check if publication exists
    await this.findOne(id);

    const deleted = await this.prisma.publication.delete({
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

    this.cache.invalidate(); // Clear cache on delete
    return deleted;
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

  async findOnePublic(id: string) {
    const cacheKey = `public:publication:${id}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const publication = await this.prisma.publication.findFirst({
      where: {
        id,
        status: 'published',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        cover_image: true,
        attachments: true,
        publication_type: true,
        tags: true,
        published_at: true,
        embassy: {
          select: {
            name: true,
            embassy_picture: true,
            country: true,
            city: true,
          },
        },
      },
    });

    if (!publication) {
      throw new NotFoundException(
        `Published publication with ID ${id} not found`,
      );
    }

    this.cache.set(cacheKey, publication, 60000); // Cache for 1 minute
    return publication;
  }

  async findByCountryPublic(
    country: string,
    city?: string,
    queryParams?: { page?: number; limit?: number; publication_type?: string },
  ) {
    const page = Number(queryParams?.page) || 1;
    const limit = Number(queryParams?.limit) || 5;
    const cacheKey = `public:country:${country}:${city || ''}:${queryParams?.publication_type || ''}:${page}:${limit}`;

    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const skip = (page - 1) * limit;

    const where: Prisma.PublicationWhereInput = {
      status: 'published',
      embassy: {
        country: { equals: country, mode: 'insensitive' },
        ...(city && { city: { equals: city, mode: 'insensitive' } }),
      },
    };

    if (queryParams?.publication_type) {
      where.publication_type = queryParams.publication_type;
    }

    const [publications, total] = await Promise.all([
      this.prisma.publication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { published_at: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          cover_image: true,
          publication_type: true,
          tags: true,
          published_at: true,
          embassy: {
            select: {
              name: true,
              embassy_picture: true,
              country: true,
              city: true,
            },
          },
        },
      }),
      this.prisma.publication.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const result = {
      data: publications,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };

    this.cache.set(cacheKey, result, 60000); // Cache for 1 minute
    return result;
  }

  async getStats(embassy_id?: string) {
    const cacheKey = `stats:${embassy_id || 'all'}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

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

    const result = {
      total,
      published,
      draft,
      archived,
      byType,
    };

    this.cache.set(cacheKey, result, 120000); // Cache for 2 minutes
    return result;
  }
}
