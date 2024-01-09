/*
 * @Author: ztao
 * @Date: 2023-12-31 00:04:50
 * @LastEditTime: 2024-01-09 20:58:17
 * @Description: 拦截器-全局请求拦截处理
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

//定义响应泛型
interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        code: '0000',
        message: '请求成功',
        data,
      })),
    );
  }
}
