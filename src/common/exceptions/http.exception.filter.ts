/*
 * @Author: ztao
 * @Date: 2024-01-08 21:32:07
 * @LastEditTime: 2024-01-18 17:52:25
 * @Description: 基于官方文档http-exception.filter.ts,catch参数类型改为HttpException,默认捕获所有http异常
 */
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const status = exception.getStatus();

    response.status(status).send({
      code: status,
      timestamp: new Date().toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
      }),
      path: request.url,
      message: exception.message,
    });
  }
}
