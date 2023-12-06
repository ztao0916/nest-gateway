# nest-gateway
掘金教程: nest项目实战学习笔记

### 准备工作

#### 版本信息

nest脚手架版本: 10.2

node板本: v16.19

pnpm版本:  8.6

#### 技术扩展

1. 依赖反转(inversion of controller)IoC 
2. 不想生成测试文件可以在`nest-cli.json`中`generateOptions`对象下配置: ` spec: false `

#### 网关系统

暂时不是特别理解,先记着.

![架构](https://cdn.jsdelivr.net/gh/ztao0916/image@main/img/20231206141941.png)

![](https://cdn.jsdelivr.net/gh/ztao0916/image@main/img/20231206142458.webp)

### 开始

#### 脚手架

```javascript
nest new projectname
pnpm install
pnpm run start
默认运行在3000端口
```

