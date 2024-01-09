# nest-gateway
掘金教程: nest项目实战学习笔记

### 准备工作

#### 版本信息

nest脚手架版本: 10.2

node板本: v16.19

pnpm版本:  8.6

#### 技术扩展

1. 控制反转(inversion of controller)IoC,它是一种思想,它告诉我们解决问题的思路,但没有具体告诉我们应该怎么做,依赖注入(DI)是实现方式

2. 不想生成测试文件可以在`nest-cli.json`中`generateOptions`对象下配置: ` spec: false `

3. 配置别名`@`,在`tsconfig.json`中添加如下内容即可

   ```json
   "paths": {
         "@/*": ["src/*"]
       }
   ```

   

#### 网关系统

暂时不是特别理解,先记着.

![架构](https://cdn.jsdelivr.net/gh/ztao0916/image@main/img/20231206141941.png)

![](https://cdn.jsdelivr.net/gh/ztao0916/image@main/img/20231206142458.webp)

### 开始(公共模块)

#### 脚手架

```javascript
nest new projectname
pnpm install
pnpm run start,开发阶段使用npm run start:dev[监听文件变化]
默认运行在3000端口,在main.js文件中可修改


app.controller.ts	一个具有单一路由的基本控制器.
app.controller.spec.ts	控制器的单元测试.(基本用不到)
app.module.ts	应用程序的根模块.
app.service.ts	一个基本的服务，拥有一个单一的方法.
main.ts	应用程序的入口文件将使用核心函数 NestFactory 来创建一个 Nest 应用程序实例.
```

![](https://cdn.jsdelivr.net/gh/ztao0916/image@main/img/202312302358011.png)

使用nest创建CRUD模块的流程如上图所示: 创建一个user模块,

需要创建一个user目录,在目录下创建对应的controller,module,service文件,数据库相关的逻辑存放在dto文件夹中

然后更新package.json文件以及根模块app.module.ts

```yaml
生成一个模块 (nest g mo) 来组织代码，使其保持清晰的界限（Module）。
生成一个控制器 (nest g co) 来定义 CRUD 路径（Controller）。
生成一个服务 (nest g s) 来表示/隔离业务逻辑（Service）。
生成一个实体类/接口来代表资源数据类型（Entity）
```

安装适配fastify的包

```nginx
 pnpm install @types/node --save-dev
 pnpm install @nestjs/platform-fastify --save
```

#### api多版本

##### 单请求自定义版本

```typescript
//main.ts新增内容
import { VersioningType } from '@nestjs/common';
...
// 接口版本化管理
app.enableVersioning({
    type: VersioningType.URI,
});

//user.controller.ts新增内容
import { Version } from '@nestjs/common';
...
@Get()
@Version('1') //版本,默认版本号v1
findAll() {
    return this.userService.findAll();
}
```

##### 全局版本

```typescript
//main.js新增内容
app.enableVersioning({
+   defaultVersion: '1',
    type: VersioningType.URI,
});

//user.controller.ts新增内容
- @Controller('user')
+ @Controller({
+  path: 'user',
+  version: '1',
+ })
```

##### 兼容版本(版本号v1/v2...可有可无)

```typescript
//main.js新增内容
import { VERSION_NEUTRAL } from '@nestjs/common';
app.enableVersioning({
+    defaultVersion: [VERSION_NEUTRAL, '1', '2']
});

//还原user.controller.ts如下即可,如果想单独指定版本,需使用单版本,自定义数组
@Controller('user')
```

开发过程中,没有特殊情况,全部使用默认**v1版本**



#### 全局返参

正常情况下,同一个系统,调用接口,返回的参数结构是一样的,大致如下

```json
{
    data, // 数据
    message: 'success', // 异常信息
    code：'0000' // 接口业务返回状态,0000和9999
}
```

需要使用拦截器,做个全局的请求拦截,文档搜索拦截器即可,有些难懂,不过多写几次就好了,文档很详细,写法其实是固定的,谨记这一点即可

#### 全局异常

处理完成正常的情况以后,需要考虑一下异常的统一处理,因为不可能所有的接口返回都正确,官方用的是过滤器,直接文档搜索过滤器即可

```
文档解释: 内置的异常层负责处理整个应用程序中的所有抛出的异常。当捕获到未处理的异常时，最终用户将收到友好的响应。
```

默认异常返回如下(错误的接口地址)

```json
{
    "message": "Cannot GET /vuser",
    "error": "Not Found",
    "statusCode": 404
}
```

官方文档http异常处理文件`http-exception.filter.ts`以及`any-exception.filter.ts`

**还存在一个问题: 怎么让返回的message是一个string而不是object**

```
已解决,直接从exception对象中拿到message即可,即是exception.message
```



#### 环境变量

看了一些文章,发现这里用yaml最好,没啥需要注意的方面

安装包`pnpm i @nestjs/config`,官方文档搜索`@nestjs/config`即可查找相关内容

更改`app.module.ts`,基于`@nestjs/config`引入`configModule`,更新后的代码如下

```typescript
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
//禁用默认读取 .env 的规则
@Module({
  imports: [ConfigModule.forRoot({ ignoreEnvFile: true }), UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

安装包`pnpm install yaml`,在根目录新建`.config`文件夹,新增文件`.dev.yaml`,`.prod.yaml`,`.test.yaml`,用哪些建那些,开发基本上只能用到dev和prod环境

在`src`目录下新建`utils/index.ts`,用来读取`yaml`文件,文件内容如下

```typescript
import { parse } from 'yaml';
import * as path from 'path';
import * as fs from 'fs';
//获取到当前环境[运行环境的时候需要添加变量RUN_ENV]
export const getEnv = () => {
  return process.env.RUN_ENV;
};
//根据当前环境读取环境配置
export const getConfig = () => {
  const environment = getEnv(); //获取到当前环境
  //根据当前环境匹配对应文件
  const yamlPath = path.join(process.cwd(), `./.config/.${environment}.yaml`);
  //获取到当前文件内容并导出
  const file = fs.readFileSync(yamlPath, 'utf8');
  const config = parse(file);
  return config;
};
```

其中`process.cwd()`需要关注一下,因为暂时不理解

以上内容完成后,更改`app.module.ts`文件,更改后结果如下

```typescript
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
```

最后要注意一下: 我们在读取yaml的时候,是根据`process.env.RUN_ENV`来获取当前环境的,所以需要更改`package.json`内的运行命令

安装包`pnpm install cross-env`

修改启动命令,原命令如下

```
"start:dev": "nest start --watch",
```

新命令如下

```
"start:dev": "cross-env RUN_ENV=dev nest start --watch",
```

相当于在原来的命令前面增加`cross-env`参数即可

然后使用如下:

在`.dev.yaml`中添加内容如下:

```yaml
TEST_VALUE:
  name: cookie
```

然后再`user.controller.ts`中新增内容,文件最后结果如下

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { ConfigService } from '@nestjs/config'; //新增内容

@UseInterceptors(LoggingInterceptor)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService, //环境变量参数
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('getTestName') //测试环境变量请求
  getTestName() {
    return this.configService.get('TEST_VALUE').name;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
```

接口调用`v1/user/getTestName`,测试成功

细节点: `configService`没有注册`configModule`就直接使用了,原因如下

```
这里应该注意到，我们并没有注册 ConfigModule。这是因为在 app.module 中添加 isGlobal 属性，开启 Config 全局注册，如果 isGlobal 没有添加的话，则需要先在对应的 module 文件中注册后才能正常使用 ConfigService。
```

简单理解就是`isGlobal`假设没有添加,那么需要再`user.module.ts`中注册一遍,也不麻烦,不过每次在对应的模块使用都要注册

```typescript
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigService } from '@nestjs/config'; //新增内容
@Module({
  controllers: [UserController],
  providers: [UserService, ConfigService],
})
export class UserModule {}
```







至此,环境变量配置完成,前期的基本工作都完成了
