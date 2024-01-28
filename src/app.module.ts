/*
 * @Author: ztao
 * @Date: 2023-12-30 11:15:45
 * @LastEditTime: 2024-01-28 22:26:02
 * @Description:禁用默认读取 .env 的规则gnoreEnvFile
 */
import { Module } from '@nestjs/common';
import { UserModule } from '@/user/user.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.dev.env', //也可以接收数组,根据proccess.env.NODE_ENV判断加载什么文件
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').default('dev'),
        PORT: Joi.number().default(8000), //校验环境变量的PORT必须是数字,如果没有PORT,那么默认8000
      }),
    }),
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
