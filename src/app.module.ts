/*
 * @Author: ztao
 * @Date: 2023-12-30 11:15:45
 * @LastEditTime: 2024-01-10 00:04:33
 * @Description:禁用默认读取 .env 的规则gnoreEnvFile
 */
import { Module } from '@nestjs/common';
import { UserModule } from '@/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { getConfig } from '@/utils';
@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      load: [getConfig],
    }),
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
