# nest-gateway

掘金教程: nest项目实战学习笔记

```
官方文档的资料是很全面的,很多写法都是固定的,跟着官方文档走即可,所以没事多翻翻,中文为主,英文为辅
```

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

### 开始(通用模板)

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

##### yaml (教程推荐,不使用)

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

##### env(采用)

```
框架默认env文件作为环境变量
这段时间的学习发现,基本上所有的框架默认的环境变量都是取自env中,这是我觉得env文件较好的原因之一:普及度高
其次,从需求出发,我在项目开发的时候,为什么要使用环境变量? 
环境变量的主要作用就是存储配置信息,比如数据库,账号密钥等,很少存储复杂的数据结构,什么嵌套,列表,映射这种基本不会存在环境变量里.所以yml文件的各种好处:复杂数据结构,跨平台支持,更多数据类型,更细粒化的版本控制,适合复杂场景等优点对我开发个人项目而言,基本属于只能看,不能用.
相对于env而言,不论我nest项目里引入什么包,都可以使用env作为环境变量,省却了更多的麻烦
所以最后决定回归env文件作为环境变量
```

跟着官方文档走

#### 接口文档

官方文档直接搜索`swagger`即可,有详细用法,这里采用官方文档的用法

安装依赖`pnpm install @nestjs/swagger `和`pnpm install @fastify/static`

在main.ts中引入相关逻辑,官方代码如下

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);

  const options = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();

```

如何使用和定义文档,看文档,很多都是通用的,主要是基于装饰器`ApiProperty`

#### 热重载

本来是觉得这个模块用处不大,但是更改接口的时候发现,有时候响应不及时,需要重启,所以还是加上了,基本上完全按照文档的来就可以解决问题

安装依赖`pnpm i --save-dev webpack-node-externals run-script-webpack-plugin webpack `

根目录下创建文件`webpack-hmr.config.js`

更改`main.ts`,代码如下

```typescript
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();

```

修改启动脚本启动命令

```yaml
"start:hotdev": "cross-env RUNNING_ENV=dev nest build --webpack --webpackPath webpack-hmr.config.js --watch"
```



以上基本上就是一个完成**通用性基础配置**的工程模板,满足大部分的个人项目需求了



### 飞书对接

```
关于飞书对接这一块,有些地方比较难理解,需要花些时间研究思考,使用chatgpt协助理解代码很有帮助
```



有个API调试台,接口可以在那边调试,其他的按步骤来即可

这里涉及到一个缓存的问题,这篇讨论:[传送门](https://www.zhihu.com/question/316430245),整体分析了一下使用内存和第三方数据库的优缺点,个人比较倾向于第三方数据库,比如redis,大致简单理解一下,原因如下:

1. 本地缓存资源浪费,比如想在缓存一份数据,ABC三个服务器都要缓存
2. 本地缓存内存一致性问题,受版本,还是有不同人修改的影响,导致不同服务器缓存不一致
3. 内存有限,如果数据太多,那么对于内存不大的服务器而已,负担很重,而且服务器出现故障以后,缓存消失
4. 多项目共用的问题,本地缓存在多项目复用的时候限制较高,A无法访问B的缓存

#### 封装底层请求库

简单理解: 为什么要封装?

`NestJS` 内置了 `@nestjs/axios` 请求库,但是依然要封装? 一方面是为了减少和`nestjs`的耦合,另一方面是为了模块化开发,便于其他`SDK`调用

不要安装`@nestjs/axios`依赖包,直接安装`axios`

```yaml
pnpm install axios
```

新建 `utils/request.ts` 文件,内容如下,**这里一知半解,先继续学习,回头仔细思考**

```typescript
import axios, { Method } from 'axios';
import { getConfig } from '@/utils';

const { FEISHU_CONFIG: { FEISHU_URL } } = getConfig()

/**
 * @description: 任意请求
 */
const request = async ({ url, option = {} }) => {
  try {
    return axios.request({
      url,
      ...option,
    });
  } catch (error) {
    throw error;
  }
};

interface IMethodV {
  url: string;
  method?: Method;
  headers?: { [key: string]: string };
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
}

export interface IRequest {
  data: any;
  code: number;
}

/**
 * @description: 带 version 的通用 api 请求
 */
const methodV = async ({
  url,
  method,
  headers,
  params = {},
  query = {},
}: IMethodV): Promise<IRequest> => {
  let sendUrl = '';
  if (/^(http:\/\/|https:\/\/)/.test(url)) {
    sendUrl = url;
  } else {
    sendUrl = `${FEISHU_URL}${url}`;
  }
  try {
    return new Promise((resolve, reject) => {
      axios({
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...headers,
        },
        url: sendUrl,
        method,
        params: query,
        data: {
          ...params,
        },
      })
        .then(({ data, status }) => {
          resolve({ data, code: status });
        })
        .catch((error) => {
          reject(error);
        });
    });
  } catch (error) {
    throw error;
  }
};

export { request, methodV };

```



创建飞书请求基础层,目录结构如下图(红框部分)

![](https://cdn.jsdelivr.net/gh/ztao0916/image@main/img/202401232236852.png)
