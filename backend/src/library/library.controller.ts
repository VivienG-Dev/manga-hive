import { Controller, Get, Post, Put, Delete, Body, UseGuards, Req, Version, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LibraryService } from './library.service';
// import { ItemType } from '@prisma/client';
import { LibraryDto } from './dto/library.dto';

export enum ItemType {
  MANGA = 'MANGA',
}

export enum Status {
  READING = 'READING',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  DROPPED = 'DROPPED',
  PLAN_TO_READ = 'PLAN_TO_READ'
}

@Controller('library')
export class LibraryController {
  constructor(private libraryService: LibraryService) { }

  @UseGuards(AuthGuard('jwt'))
  @Version('1')
  @Post()
  async addToLibrary(@Req() req, @Body() data: {
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
    const userId = req.user.userId;
    return this.libraryService.addToLibrary(userId, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Version('1')
  @Get()
  async getLibrary(@Req() req) {
    const userId = req.user.userId;
    return this.libraryService.getLibrary(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Version('1')
  @Delete()
  removeFromLibrary(@Body('id') id: number) {
    return this.libraryService.removeFromLibrary(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Version('1')
  @Put()
  updateLibraryEntry(@Body() data: LibraryDto) {
    const { id, ...updateData } = data;
    return this.libraryService.updateLibraryEntry(id, updateData);
  }
}