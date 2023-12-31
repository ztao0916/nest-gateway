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

