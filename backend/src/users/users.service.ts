import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ItemType, Status } from '@prisma/client';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: number, requestingUserId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        imageUrl: true,
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
        imageUrl: true,
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
    const updateData: any = {};

    if (body.username !== undefined) {
      updateData.username = body.username;
    }

    if (body.password !== undefined) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    if (body.imageUrl !== undefined) {
      updateData.imageUrl = body.imageUrl;
    }

    if (body.private !== undefined) {
      updateData.private = body.private;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  async addToLibrary(userId: number, malId: number, itemType: ItemType) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.libraryEntry.create({
      data: {
        userId: userId,
        itemType: itemType,
        itemId: malId,
        status: Status.PLAN_TO_WATCH,
      },
    });
  }

  async getUserLibrary(userId: number) {
    return this.prisma.libraryEntry.findMany({
      where: { userId: userId },
    });
  }
}
