/*
 * @Author: ztao
 * @Date: 2023-12-06 14:28:53
 * @LastEditTime: 2024-01-14 16:12:16
 * @Description: 入口文件,通过核心函数NestFactory创建http启动器
 */
import { NestFactory } from '@nestjs/core'; //引入核心函数NestFactory
// import { VersioningType, VERSION_NEUTRAL } from '@nestjs/common';
import { VersioningType } from '@nestjs/common'; //引入多版本控制
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor'; //引入全局响应体格式统一处理
import { AllExceptionsFilter } from '@/common/exceptions/base.exception.filter'; //引入全局异常过滤器
import { HttpExceptionFilter } from '@/common/exceptions/http.exception.filter'; //引入http异常过滤器
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; //引入swagger依赖,处理api文档
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'; //引入fastify依赖,处理fastify启动器
import { AppModule } from './app.module'; //引入根模块

declare const module: any;

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

  //swagger配置
  const options = new DocumentBuilder()
    .setTitle('api接口文档')
    .setDescription('api接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  //HMR热重载
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  await app.listen(5000);
}
bootstrap();
