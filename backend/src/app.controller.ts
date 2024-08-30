import { Controller, Version, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('hello')
  @Version('1')
  protectedRoute(@Req() req) {
    return { message: "Hello, you're authenticated!", userId: req.userId };
  }
}
