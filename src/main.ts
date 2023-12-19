/*
 * @Author: ztao
 * @Date: 2023-12-06 14:28:53
 * @LastEditTime: 2023-12-19 09:47:49
 * @Description: 入口文件,通过核心函数NestFactory创建http启动器
 */
import { NestFactory } from '@nestjs/core';
// import { VersioningType, VERSION_NEUTRAL } from '@nestjs/common';
import { VersioningType } from '@nestjs/common';

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
  //多版本控制
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    // defaultVersion: [VERSION_NEUTRAL, '1', '2'],
  });

  await app.listen(5000);
}
bootstrap();
