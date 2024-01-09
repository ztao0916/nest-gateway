/*
 * @Author: ztao
 * @Date: 2023-12-06 14:28:53
 * @LastEditTime: 2024-01-09 20:58:06
 * @Description: 入口文件,通过核心函数NestFactory创建http启动器
 */
import { NestFactory } from '@nestjs/core';
// import { VersioningType, VERSION_NEUTRAL } from '@nestjs/common';
import { VersioningType } from '@nestjs/common';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '@/common/exceptions/base.exception.filter';
import { HttpExceptionFilter } from '@/common/exceptions/http.exception.filter';

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // 全局前缀
  // app.setGlobalPrefix('api');
  //全局响应体格式统一处理
  app.useGlobalInterceptors(new TransformInterceptor());
  //多版本控制
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    // defaultVersion: [VERSION_NEUTRAL, '1', '2'],
  });
  //异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  await app.listen(5000);
}
bootstrap();
