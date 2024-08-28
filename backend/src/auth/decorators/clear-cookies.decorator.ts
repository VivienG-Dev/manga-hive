import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Response } from 'express';

export const ClearCookies = createParamDecorator(
  (data: string[], ctx: ExecutionContext) => {
    const response = ctx.switchToHttp().getResponse<Response>();
    return (cookieNames: string[]) => {
      cookieNames.forEach((name) => {
        response.clearCookie(name);
      });
    };
  },
);
