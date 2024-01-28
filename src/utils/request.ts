/*
 * @Author: ztao
 * @Date: 2024-01-23 22:14:13
 * @LastEditTime: 2024-01-28 22:26:42
 * @Description: 封装请求
 */
import axios, { Method } from 'axios';

//获取飞书配置信息
const FEISHU_URL = process.env.FEISHU_URL;

//封装任意请求
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

//定义接口
interface IMethodV {
  url: string; //字符串
  method?: Method; //方法
  headers?: { [key: string]: string }; //请求头
  params?: Record<string, unknown>; //请求参数params
  query?: Record<string, unknown>; //请求参数query
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
  //如果有http,请求链接就是url参数
  if (/^(http:\/\/|https:\/\/)/.test(url)) {
    sendUrl = url;
  } else {
    //没有链接,请求url就是两个拼接
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
        params: query, //get请求传参
        data: {
          //post请求传参
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
