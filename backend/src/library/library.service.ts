import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Status, ItemType } from '@prisma/client';

@Injectable()
export class LibraryService {
  constructor(private prisma: PrismaService) { }

  async addToLibrary(userId: number, data: {
    malId: number;
    itemType: ItemType;
    status: Status;
    title: string;
    imageUrl: string;
    synopsis: string;
    authors: string;
    genres: string;
    chapters: number;
    volumes: number;
    userScore: number;
    chaptersProgress: number;
    volumesProgress: number;
    notes: string;
  }) {
    const existingEntry = await this.prisma.libraryEntry.findUnique({
      where: {
        userId_malId_itemType: {
          userId,
          malId: data.malId,
          itemType: data.itemType,
        },
      },
    });

    if (existingEntry) {
      // return this.prisma.libraryEntry.update({
      //   where: { id: existingEntry.id },
      //   data,
      // });
      return { message: 'Item already in library.' };
    } else {
      return this.prisma.libraryEntry.create({
        data: {
          userId,
          ...data,
        },
      });
    }
  }

  async getLibrary(userId: number) {
    return this.prisma.libraryEntry.findMany({
      where: { userId },
    });
  }

  async updateLibraryEntry(id: number, data: {
    status: Status;
    userScore: number;
    volumesProgress: number;
    chaptersProgress: number;
    notes: string;
  }) {
    return this.prisma.libraryEntry.update({
      where: { id },
      data,
    });
  }

  async removeFromLibrary(id: number) {
    await this.prisma.libraryEntry.delete({
      where: {
        id,
      },
    });
    return { message: 'Item removed from library successfully.' };
  }
}
