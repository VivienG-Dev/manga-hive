import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Put,
  Post,
  Req,
  Version,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
// import { ItemType } from '@prisma/client';
import { Request } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Version('1')
  @Get('me')
  getMe(@Req() req: Request) {
    const userId = (req.user as any).userId;
    if (!userId) {
      throw new Error('User ID not found in JWT payload');
    }
    return this.usersService.findOne(userId, userId);
  }

  @Public()
  @Version('1')
  @Get(':username')
  async getUserByUsername(
    @Param('username') username: string,
    @Req() req: Request,
  ) {
    const requestingUserId = req.user ? (req.user as any).userId : undefined;
    return this.usersService.findByUsername(username, requestingUserId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Version('1')
  @Put('me')
  updateMe(@Req() req: Request, @Body() userDto: Partial<UserDto>) {
    const userId = (req.user as any).userId;
    return this.usersService.update(userId, userDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Version('1')
  @Delete('me')
  removeMe(@Req() req: Request) {
    const userId = (req.user as any).userId;
    return this.usersService.remove(userId);
  }
}
