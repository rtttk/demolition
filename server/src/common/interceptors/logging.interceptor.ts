import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

/**
 * JSON序列化时处理BigInt类型
 */
function bigIntReplacer(_key: string, value: any): any {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const { method, url, body, query, params, headers } = request;
    const startTime = Date.now();

    // 请求信息
    const requestLog = {
      method,
      url,
      query: Object.keys(query || {}).length > 0 ? query : undefined,
      params: Object.keys(params || {}).length > 0 ? params : undefined,
      body: this.sanitizeBody(body),
      ip: headers['x-forwarded-for'] || request.ip,
    };

    return next.handle().pipe(
      tap((data) => {
        // 异步输出日志，避免阻塞主流程
        setImmediate(() => {
          const duration = Date.now() - startTime;
          const responseLog = {
            method,
            url,
            duration: `${duration}ms`,
            requestBody: requestLog.body,
            responseBody: this.sanitizeResponse(data),
            statusCode: response.statusCode || 200,
          };

          this.logger.log(JSON.stringify(responseLog, bigIntReplacer, 2));
        });
      }),
      catchError((error) => {
        // 异步输出错误日志
        setImmediate(() => {
          const duration = Date.now() - startTime;
          const errorLog = {
            method,
            url,
            duration: `${duration}ms`,
            requestBody: requestLog.body,
            error: {
              name: error.name,
              message: error.message,
              statusCode: error.status || 500,
            },
          };

          this.logger.error(JSON.stringify(errorLog, bigIntReplacer, 2));
        });

        return throwError(() => error);
      }),
    );
  }

  /**
   * 过滤敏感信息
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'passwordConfirm', 'oldPassword', 'newPassword', 'token', 'accessToken', 'refreshToken'];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '******';
      }
    }

    return sanitized;
  }

  /**
   * 过滤响应中的敏感信息
   */
  private sanitizeResponse(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // 如果响应数据过大，只显示部分
    const str = JSON.stringify(data, bigIntReplacer);
    if (str.length > 2000) {
      return {
        _truncated: true,
        _size: str.length,
        _preview: str.substring(0, 500) + '...',
      };
    }

    return data;
  }
}
