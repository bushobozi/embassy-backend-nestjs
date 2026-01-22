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

@Injectable()
export class InformationBoardService {
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
    return updatedBoard;
  }

  async remove(id: string) {
    const existingBoard = await this.prisma.informationBoard.findUnique({
      where: { id },
    });
    if (!existingBoard) {
      throw new NotFoundException(`Information Board with ${id} not found`);
    }
    return this.prisma.informationBoard.delete({
      where: { id },
    });
  }

  async getStats(embassyId?: string) {
    const where = embassyId ? { embassy_id: embassyId } : {};
    const totalBoards = await this.prisma.informationBoard.count({ where });
    const activeBoards = await this.prisma.informationBoard.count({
      where: { ...where, is_active: true },
    });
    const inactiveBoards = await this.prisma.informationBoard.count({
      where: { ...where, is_active: false },
    });

    return {
      totalBoards,
      activeBoards,
      inactiveBoards,
    };
  }

  async findByLocationPublic(location: string, queryParams?: QueryBoardsDto) {
    const where: {
      location?: string;
      category?: string;
      is_active: boolean;
    } = {
      is_active: true, // Only return active boards for public access
    };

    if (location) {
      where.location = location;
    }

    if (queryParams?.category) {
      where.category = queryParams.category;
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

  async findByCountryPublic(
    country: string,
    city?: string,
    queryParams?: QueryBoardsDto,
  ) {
    const page = Number(queryParams?.page) || 1;
    const limit = Number(queryParams?.limit) || 25;
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

    return {
      data: boards,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
