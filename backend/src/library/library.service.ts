import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Status, ItemType } from '@prisma/client';

@Injectable()
export class LibraryService {
  constructor(private prisma: PrismaService) {}

  async addToLibrary(userId: number, data: { malId: number; itemType: ItemType; title: string; imageUrl: string; synopsis: string; authors: string; genres: string; chapters: number; volumes: number; score: number; }) {
    return this.prisma.libraryEntry.create({
      data: {
        userId,
        malId: data.malId,
        itemType: data.itemType,
        status: Status.PLAN_TO_READ,
        title: data.title,
        imageUrl: data.imageUrl,
        synopsis: data.synopsis,
        authors: data.authors,
        genres: data.genres,
        chapters: data.chapters,
        volumes: data.volumes,
        score: data.score,
      },
    });
  }

  async getLibrary(userId: number) {
    return this.prisma.libraryEntry.findMany({
      where: { userId },
    });
  }
}
