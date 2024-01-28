/*
 * @Author: ztao
 * @Date: 2023-12-30 11:15:45
 * @LastEditTime: 2024-01-28 21:24:09
 * @Description:禁用默认读取 .env 的规则gnoreEnvFile
 */
import { Module } from '@nestjs/common';
import { UserModule } from '@/user/user.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.dev.env', //也可以接收数组,根据proccess.env.NODE_ENV判断加载什么文件
    }),
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
