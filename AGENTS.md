## 项目简介

该项目是一个面向上海地区的拆除行业的小程序平台，致力于透明及规范拆除行业的标准，为供需双方提供信息交换的平台。

## 工程介绍

### admin
运营后台管理前端，主要提供用户管理、角色管理、报价审核、订单管理等功能

### client
小程序C端，为需求方、拆除团队方（服务方）提供信息交换的平台。需求方可以发布需求、查看拆除的要求规范、查看优秀的拆除团队、查看自己需求团队的报价情况等。服务方可以查看需求发布的需求，进行报价。

#### 小程序端的界面设计
整体以极简风为主，详见如下：
[小程序端的界面设计规范](docs/极简主义UI设计规范.md)

#### 小程序开发注意事项
- 小程序中的 '>' 符号需要通过 decode 属性转译，如：`<text class="arrow" decode>{{ '>' }}</text>`

### server
是admin及client的通用后台服务，为他们提供api接口服务。
开发者模式启动命令npm run start:dev，修改后会自动热不熟不需要重启。

## 日志输出规范

### 统一日志工具
使用 `src/common/utils/logger.util.ts` 提供的统一日志工具，禁止使用 `console.log/error/warn`：

```typescript
import { log, error, warn, debug, logger } from '../../common/utils/logger.util';

// 便捷方法（推荐）
log('信息日志');           // logger.info()
error('错误日志');         // logger.error()
warn('警告日志');          // logger.warn()
debug('调试日志');         // logger.debug()

// 直接使用 logger 实例
logger.info('信息日志', { key: 'value' });
logger.error('错误日志', { key: 'value' });
```

### 日志级别使用场景
- **log/info**: 正常业务流程、定时任务执行、关键操作完成
- **warn**: 业务警告（如重试、异常恢复）
- **error**: 业务异常、捕获的异常
- **debug**: 开发调试信息（生产环境默认不输出）

### 日志格式
自动包含时间戳、级别标识，输出示例：
```
2026-06-15 10:30:00.123 [INFO] [定时任务] 开始检查订单开工状态...
2026-06-15 10:30:00.456 [INFO] [定时任务] 订单开工状态检查完成，更新了 3 个订单
```

### 日志文件
日志输出到 `logs/` 目录，按天轮转：
- `YYYY-MM-DD.log` - 全量日志
- `YYYY-MM-DD-error.log` - 错误日志

## 基础环境
nodejs v24.14.0

