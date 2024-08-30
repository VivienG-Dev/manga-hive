import { Controller, Get, Post, Body, UseGuards, Req, Version } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LibraryService } from './library.service';

@Controller('library')
export class LibraryController {
  constructor(private libraryService: LibraryService) {}

  @UseGuards(AuthGuard('jwt'))
  @Version('1')
  @Post()
  async addToLibrary(@Req() req, @Body() data: { malId: number; itemType: "MANGA"; title: string; imageUrl: string; synopsis: string; authors: string; genres: string; chapters: number; volumes: number; score: number; }) {
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
}