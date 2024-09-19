import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async findOne(id: number, requestingUserId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        backgroundImageUrl: true,
        private: true,
        libraryEntries: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.filterUserData(user, requestingUserId);
  }

  async findByUsername(username: string, requestingUserId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        backgroundImageUrl: true,
        private: true,
        libraryEntries: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.filterUserData(user, requestingUserId);
  }

  private filterUserData(user: any, requestingUserId?: number) {
    // If the profile is private and the requesting user is not the profile owner
    if (user.private && (!requestingUserId || requestingUserId !== user.id)) {
      throw new ForbiddenException('This profile is private');
    }

    // Create a copy of the user object to avoid modifying the original
    const filteredUser = { ...user };

    // Remove sensitive information for non-owners
    if (requestingUserId !== user.id) {
      delete filteredUser.email;
      // Add any other fields you want to hide from non-owners
    }

    // For non-authenticated users or non-owners, remove additional private information
    if (!requestingUserId || requestingUserId !== user.id) {
      delete filteredUser.private;
      // Add any other fields you want to hide from the public
    }

    return filteredUser;
  }

  async update(id: number, body: Partial<UserDto>) {
    const updateData: Partial<UserDto> = {};

    if (body.username !== undefined) {
      updateData.username = body.username;
    }

    if (body.avatarUrl !== undefined) {
      updateData.avatarUrl = body.avatarUrl;
    }

    if (body.backgroundImageUrl !== undefined) {
      updateData.backgroundImageUrl = body.backgroundImageUrl;
    }

    if (body.private !== undefined) {
      updateData.private = body.private;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async uploadFile(id: number, fieldName: 'avatarUrl' | 'backgroundImageUrl', fileUrl: string) {
    return this.prisma.user.update({
      where: { id },
      data: { [fieldName]: fileUrl },
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
  }
}
