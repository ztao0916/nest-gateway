/*
 * @Author: ztao
 * @Date: 2024-01-09 23:22:59
 * @LastEditTime: 2024-01-09 23:56:15
 * @Description: 根据当前运行环境读取yaml文件,获取当前环境的配置信息
 */
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
  //获取到当前文件内容
  const file = fs.readFileSync(yamlPath, 'utf8');
  const config = parse(file);
  return config;
};
