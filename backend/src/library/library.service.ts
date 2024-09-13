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
    return this.prisma.libraryEntry.create({
      data: {
        userId,
        malId: data.malId,
        itemType: data.itemType,
        status: data.status,
        title: data.title,
        imageUrl: data.imageUrl,
        synopsis: data.synopsis,
        authors: data.authors,
        genres: data.genres,
        chapters: data.chapters,
        volumes: data.volumes,
        userScore: data.userScore,
        chaptersProgress: data.chaptersProgress,
        volumesProgress: data.volumesProgress,
        notes: data.notes,
      },
    });
  }

  async getLibrary(userId: number) {
    return this.prisma.libraryEntry.findMany({
      where: { userId },
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
