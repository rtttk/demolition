import * as winston from 'winston';
import * as path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';

const logDir = path.join(process.cwd(), 'logs');

// 统一的格式化
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `${timestamp} [${level.toUpperCase()}] ${message}\n${stack}`;
    }
    return `${timestamp} [${level.toUpperCase()}] ${message}`;
  }),
);

// 创建 logger 实例，同时输出到控制台和文件
export const logger = winston.createLogger({
  level: 'debug',
  format,
  transports: [
    // 控制台
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        format,
      ),
    }),
    // 按天轮转的日志文件
    new DailyRotateFile({
      dirname: logDir,
      filename: '%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '50m',
      maxFiles: '7d',
      level: 'debug',
    }),
    // 错误日志单独文件
    new DailyRotateFile({
      dirname: logDir,
      filename: '%DATE%-error.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error',
    }),
  ],
});

// 便捷方法
export const log = (message: string, ...args: any[]) => logger.info(message, ...args);
export const error = (message: string, ...args: any[]) => logger.error(message, ...args);
export const warn = (message: string, ...args: any[]) => logger.warn(message, ...args);
export const debug = (message: string, ...args: any[]) => logger.debug(message, ...args);
