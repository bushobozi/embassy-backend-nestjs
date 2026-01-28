import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateBoardDto,
  UpdateBoardDto,
  QueryBoardsDto,
} from './export-information-boards';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

// Type for Information Board with Embassy relation
type BoardWithEmbassy = Prisma.InformationBoardGetPayload<{
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
export class InformationBoardService {
  private cache = new SimpleCache();

  constructor(private prisma: PrismaService) {}

  async findAll(queryParams?: QueryBoardsDto) {
    const where: {
      embassy_id?: string;
      created_by?: string;
      category?: string;
      is_active?: boolean;
    } = {};

    if (queryParams) {
      if (queryParams.embassy_id !== undefined) {
        where.embassy_id = queryParams.embassy_id.toString();
      }

      if (queryParams.created_by !== undefined) {
        where.created_by = queryParams.created_by;
      }

      if (queryParams.category !== undefined) {
        where.category = queryParams.category;
      }

      if (queryParams.is_active !== undefined) {
        where.is_active = queryParams.is_active;
      }
    }

    const page = Number(queryParams?.page) || 1;
    const limit = Number(queryParams?.limit) || 25;
    const skip = (page - 1) * limit;

    const [boards, total] = await Promise.all([
      this.prisma.informationBoard.findMany({
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
      this.prisma.informationBoard.count({ where }),
    ]);

    const mappedBoards = boards.map((board: BoardWithEmbassy) => ({
      ...board,
      embassy: board.embassy,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: mappedBoards,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string) {
    const board = await this.prisma.informationBoard.findUnique({
      where: { id },
    });
    if (!board) {
      throw new NotFoundException(`Information Board with ${id} not found`);
    }
    const typedBoard = board as BoardWithEmbassy;
    return {
      ...typedBoard,
      embassy: typedBoard.embassy,
    };
  }

  async create(
    createBoardDto: CreateBoardDto,
    created_by: string,
    embassy_id: string,
  ) {
    const {
      title,
      category,
      image,
      description,
      is_active,
      location,
      attachments,
    } = createBoardDto;

    const newBoard = await this.prisma.informationBoard.create({
      data: {
        title,
        ...(category && { category }),
        ...(image && { image }),
        ...(attachments && { attachments }),
        ...(description && { description }),
        is_active,
        location,
        embassy_id: embassy_id,
        created_by: created_by,
      },
      select: {
        id: true,
        title: true,
        category: true,
        image: true,
        description: true,
        attachments: true,
        is_active: true,
        location: true,
        created_by: true,
        created_at: true,
        updated_at: true,
      },
    });
    this.cache.invalidate(); // Clear cache on create
    return newBoard;
  }

  async update(id: string, updateBoardDto: UpdateBoardDto) {
    const existingBoard = await this.prisma.informationBoard.findUnique({
      where: { id },
    });
    if (!existingBoard) {
      throw new NotFoundException(`Information Board with ${id} not found`);
    }
    const updatedBoard = await this.prisma.informationBoard.update({
      where: { id },
      data: {
        ...updateBoardDto,
      },
    });
    this.cache.invalidate(); // Clear cache on update
    return updatedBoard;
  }

  async remove(id: string) {
    const existingBoard = await this.prisma.informationBoard.findUnique({
      where: { id },
    });
    if (!existingBoard) {
      throw new NotFoundException(`Information Board with ${id} not found`);
    }
    const deleted = await this.prisma.informationBoard.delete({
      where: { id },
    });
    this.cache.invalidate(); // Clear cache on delete
    return deleted;
  }

  async getStats(embassyId?: string) {
    const cacheKey = `stats:${embassyId || 'all'}`;
    const cached = this.cache.get<{
      totalBoards: number;
      activeBoards: number;
      inactiveBoards: number;
    }>(cacheKey);
    if (cached) return cached;

    const where = embassyId ? { embassy_id: embassyId } : {};
    const [totalBoards, activeBoards, inactiveBoards] = await Promise.all([
      this.prisma.informationBoard.count({ where }),
      this.prisma.informationBoard.count({
        where: { ...where, is_active: true },
      }),
      this.prisma.informationBoard.count({
        where: { ...where, is_active: false },
      }),
    ]);

    const result = { totalBoards, activeBoards, inactiveBoards };
    this.cache.set(cacheKey, result, 120000); // Cache for 2 minutes
    return result;
  }

  async findByLocationPublic(location: string, queryParams?: QueryBoardsDto) {
    const page = Number(queryParams?.page) || 1;
    const limit = Number(queryParams?.limit) || 25;
    const cacheKey = `public:location:${location}:${queryParams?.category || ''}:${page}:${limit}`;

    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const where: {
      location?: string;
      category?: string;
      is_active: boolean;
    } = {
      is_active: true,
    };

    if (location) {
      where.location = location;
    }

    if (queryParams?.category) {
      where.category = queryParams.category;
    }

    const skip = (page - 1) * limit;

    const [boards, total] = await Promise.all([
      this.prisma.informationBoard.findMany({
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
      this.prisma.informationBoard.count({ where }),
    ]);

    const mappedBoards = boards.map((board: BoardWithEmbassy) => ({
      ...board,
      embassy: board.embassy,
    }));

    const totalPages = Math.ceil(total / limit);

    const result = {
      data: mappedBoards,
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

  async findByCountryPublic(
    country: string,
    city?: string,
    queryParams?: QueryBoardsDto,
  ) {
    const page = Number(queryParams?.page) || 1;
    const limit = Number(queryParams?.limit) || 25;
    const cacheKey = `public:country:${country}:${city || ''}:${queryParams?.category || ''}:${page}:${limit}`;

    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const skip = (page - 1) * limit;

    const where: Prisma.InformationBoardWhereInput = {
      is_active: true,
      embassy: {
        country: { equals: country, mode: 'insensitive' },
        ...(city && { city: { equals: city, mode: 'insensitive' } }),
      },
    };

    if (queryParams?.category) {
      where.category = queryParams.category;
    }

    const [boards, total] = await Promise.all([
      this.prisma.informationBoard.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
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
      this.prisma.informationBoard.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const result = {
      data: boards,
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
}
