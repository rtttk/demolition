import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

// 确保 logs 目录存在
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 获取当日日志文件路径
const getLogFiles = () => {
  const today = new Date().toISOString().split('T')[0];
  return {
    logFile: path.join(logDir, `${today}.log`),
    errorLogFile: path.join(logDir, `${today}-error.log`),
  };
};

// 统一的格式化
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `${timestamp} [${level.toUpperCase()}] ${message}\n${stack}`;
    }
    return `${timestamp} [${level.toUpperCase()}] ${message}`;
  }),
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `${timestamp} [${level}] ${message}\n${stack}`;
    }
    return `${timestamp} [${level}] ${message}`;
  }),
);

// 创建 logger 实例
export const logger = winston.createLogger({
  level: 'debug',
  format: fileFormat,
  transports: [
    // 控制台
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // 普通日志文件
    new winston.transports.File({
      filename: getLogFiles().logFile,
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 7,
      level: 'debug',
    }),
    // 错误日志文件
    new winston.transports.File({
      filename: getLogFiles().errorLogFile,
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 14,
      level: 'error',
    }),
  ],
});

// 便捷方法
export const log = (message: string, ...args: any[]) => logger.info(message, ...args);
export const error = (message: string, ...args: any[]) => logger.error(message, ...args);
export const warn = (message: string, ...args: any[]) => logger.warn(message, ...args);
export const debug = (message: string, ...args: any[]) => logger.debug(message, ...args);
