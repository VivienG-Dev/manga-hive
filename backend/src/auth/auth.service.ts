import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './Dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './Dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) { }

  async signup(signupDto: SignupDto) {
    const { email, password, username } = signupDto;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
        },
      });

      // Generate verification link
      const verificationToken = this.jwtService.sign({ userId: user.id }, { expiresIn: '1d' });
      const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

      // Send verification email
      await this.emailService.sendVerificationEmail(email, verificationLink);

      return { message: 'User created successfully. Please check your email to verify your account.' };
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

      // After successful login, you might want to send a notification email
      await this.emailService.sendVerificationEmail(userData.email, 'New login detected');

      return this.generateAccessToken(userData.id);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
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
    console.log('Generating access token for user: ' + userId);
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
      // First, try to find an existing refresh token for this user
      const existingToken = await this.prisma.refreshToken.findUnique({
        where: { userId },
      });

      if (existingToken) {
        // If a token exists, update it
        await this.prisma.refreshToken.update({
          where: { userId },
          data: {
            token: refreshToken,
            expiresAt: expiryDate,
          },
        });
      } else {
        // If no token exists, create a new one
        await this.prisma.refreshToken.create({
          data: {
            userId,
            token: refreshToken,
            expiresAt: expiryDate,
          },
        });
      }
    } catch (error) {
      Logger.error('Error storing refresh token: ' + error.message);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({ where: { id: payload.userId } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.emailVerified) {
        return { message: 'Email already verified' };
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });

      return { message: 'Email verified successfully' };
    } catch (error) {
      // if (error instanceof jwt.JsonWebTokenError) {
      //   throw new UnauthorizedException('Invalid token');
      // }
      throw error;
    }
  }
}
