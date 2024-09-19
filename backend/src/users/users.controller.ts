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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Request } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';
import * as sharp from 'sharp';
import * as fs from 'fs/promises';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

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

  @UseGuards(AuthGuard('jwt'))
  @Version('1')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
        return cb(null, `${randomName}${extname(file.originalname)}`)
      }
    })
  }))
  async uploadFile(@UploadedFile() file, @Req() req: Request, @Body('fieldName') fieldName: 'avatarUrl' | 'backgroundImageUrl') {
    const userId = (req.user as any).userId;

    // Convert to webp
    const webpFilename = `${file.filename.split('.')[0]}.webp`;
    const webpPath = join(process.cwd(), 'uploads', webpFilename);

    if (fieldName === 'avatarUrl') {
      await sharp(file.path)
        .resize(200)
        .webp({ quality: 80 })
        .toFile(webpPath);
    }

    if (fieldName === 'backgroundImageUrl') {
      await sharp(file.path)
        .resize(1024, 500)
        .webp({ quality: 80 })
        .toFile(webpPath);
    }

    // Remove the original file
    await fs.unlink(file.path);

    const fileUrl = `${req.protocol}://${req.get('Host')}/uploads/${webpFilename}`;
    await this.usersService.uploadFile(userId, fieldName, fileUrl);

    return { url: fileUrl };
  }

  @UseGuards(AuthGuard('jwt'))
  @Version('1')
  @Put('me/change-password')
  async changePassword(
    @Req() req: Request,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    const userId = (req.user as any).userId;
    await this.usersService.changePassword(userId, oldPassword, newPassword);
    return { message: 'Password changed successfully' };
  }
}
