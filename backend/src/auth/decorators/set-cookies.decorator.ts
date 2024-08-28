import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Response } from 'express';

export const SetCookies = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const response = ctx.switchToHttp().getResponse<Response>();
    return (name: string, value: string, options?: any) => {
      response.cookie(name, value, options);
    };
  },
);
