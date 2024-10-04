import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LibraryController } from './library/library.controller';
import { LibraryService } from './library/library.service';
import { LibraryModule } from './library/library.module';
import { EmailService } from './email/email.service';
import { EmailController } from './email/email.controller';

@Module({
  imports: [UsersModule, PrismaModule, AuthModule, LibraryModule],
  controllers: [AppController, LibraryController, EmailController],
  providers: [AppService, LibraryService, EmailService],
})
export class AppModule {}
