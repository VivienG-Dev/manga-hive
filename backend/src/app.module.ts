import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LibraryController } from './library/library.controller';
import { LibraryService } from './library/library.service';
import { LibraryModule } from './library/library.module';

@Module({
  imports: [UsersModule, PrismaModule, AuthModule, LibraryModule],
  controllers: [AppController, LibraryController],
  providers: [AppService, LibraryService],
})
export class AppModule {}
