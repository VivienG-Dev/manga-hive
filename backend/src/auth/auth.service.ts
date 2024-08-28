import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, password, username } = signupDto;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      await this.prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
        },
      });

      return { message: 'User created successfully' };
    } catch (error) {
      // P2002 is the Prisma error code for unique constraint violations
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('username')) {
          throw new ConflictException('Username already exists');
        } else if (error.meta?.target?.includes('email')) {
          throw new ConflictException('Email already exists');
        }
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      const userData = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!userData) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, userData.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return this.generateAccessToken(userData.id);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.delete({ where: { token: refreshToken } });
    return { message: 'Logged out successfully' };
  }

  async refreshToken(refreshToken: string) {
    const tokenData = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken, expiresAt: { gte: new Date() } },
    });

    if (!tokenData) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.generateAccessToken(tokenData.userId);
  }

  async generateAccessToken(userId: number) {
    const payload = { userId: userId };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = crypto.randomUUID();

    await this.storeRefreshToken(userId, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async storeRefreshToken(userId: number, refreshToken: string) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    try {
      await this.prisma.refreshToken.upsert({
        where: { userId },
        update: {
          token: refreshToken,
        },
        create: {
          userId,
          token: refreshToken,
          expiresAt: expiryDate,
        },
      });
    } catch (error) {
      Logger.error(error.message);
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
