# 拆除服务小程序 MVP 系统设计文档

> 版本：v1.0 | 日期：2026-04-27
> 基于《拆除服务小程序MVP功能规划》文档，本文档描述系统的技术架构、数据库设计、接口规范、页面结构及安全方案。

---

## 一、系统整体架构

### 1.1 系统分层架构

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                              │
│  ┌─────────────────────┐    ┌──────────────────────────┐    │
│  │  微信小程序 (uni-app) │    │  Web后台 (Vue3+ElementPlus) │    │
│  │  需求方视图 / 服务方视图│    │  平台运营管理               │    │
│  └──────────┬──────────┘    └────────────┬─────────────┘    │
└─────────────┼────────────────────────────┼──────────────────┘
              │  HTTPS                    │  HTTPS
┌─────────────┼────────────────────────────┼──────────────────┐
│             ▼         网关层            ▼                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Nginx 反向代理 / 负载均衡                  │   │
│  │        SSL终止 · 请求路由 · 静态资源 · 限流            │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │              Node.js (Nest.js) 应用层                  │   │
│  │                                                        │   │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌───────────┐  │   │
│  │  │用户模块  │ │需求模块  │ │报价模块   │ │订单模块    │  │   │
│  │  └─────────┘ └─────────┘ └──────────┘ └───────────┘  │   │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌───────────┐  │   │
│  │  │团队模块  │ │施工日志  │ │评价模块   │ │合规文档    │  │   │
│  │  └─────────┘ └─────────┘ └──────────┘ └───────────┘  │   │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐               │   │
│  │  │消息通知  │ │文件上传  │ │数据采集   │               │   │
│  │  └─────────┘ └─────────┘ └──────────┘               │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │                    数据层                              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │   │
│  │  │  MySQL   │  │  Redis   │  │   阿里云 OSS      │   │   │
│  │  │ 主数据库  │  │ 缓存/会话 │  │ 图片/视频/文档    │   │   │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   外部服务层                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │   │
│  │  │微信开放平台│  │腾讯地图API│  │微信订阅消息      │   │   │
│  │  │(登录/支付) │  │(定位/地图) │  │(通知推送)        │   │   │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 部署架构（MVP阶段）

```
┌──────────────────────────────────────────┐
│              阿里云 ECS (1台)              │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │         Docker Compose           │    │
│  │                                  │    │
│  │  ┌────────┐  ┌────────────────┐  │    │
│  │  │ Nginx  │  │  Nest.js App   │  │    │
│  │  │ :80/443│  │  :3000         │  │    │
│  │  └────────┘  └────────────────┘  │    │
│  │  ┌────────┐  ┌────────────────┐  │    │
│  │  │ MySQL  │  │    Redis       │  │    │
│  │  │ :3306  │  │    :6379       │  │    │
│  │  └────────┘  └────────────────┘  │    │
│  └──────────────────────────────────┘    │
│                                          │
│  阿里云 RDS (可选，后期迁移)              │
│  阿里云 OSS (图片/视频/文档存储)          │
│  阿里云 CDN (静态资源加速)                │
│  域名 + SSL证书                          │
└──────────────────────────────────────────┘
```

> **MVP阶段说明**：初期使用单台ECS + Docker Compose部署，降低运维成本。用户量增长后可迁移至阿里云RDS、K8s等。

---

## 二、技术选型确认

| 层面 | 技术方案 | 版本建议 |
|------|---------|---------|
| 小程序前端 | uni-app (Vue3) | uni-app 3.x + Vue 3 + TypeScript |
| Web后台前端 | Vue3 + Element Plus | Vue 3.4+ + Element Plus 2.x |
| 后端框架 | Nest.js | Nest.js 10.x + TypeScript |
| ORM | Prisma / TypeORM | Prisma 5.x（推荐）|
| 数据库 | MySQL | MySQL 8.0+ |
| 缓存 | Redis | Redis 7.x |
| 对象存储 | 阿里云 OSS | SDK v6.x |
| 地图服务 | 腾讯地图微信小程序SDK | 最新版 |
| 消息推送 | 微信订阅消息 | — |
| 反向代理 | Nginx | 1.24+ |
| 容器化 | Docker + Docker Compose | — |
| API文档 | Swagger (OpenAPI 3.0) | @nestjs/swagger |

---

## 三、数据库设计

### 3.1 ER 关系总览

```
组织结构：Company(独立) → Team(1:N) ← User(N:1, 员工归属)
           User(1:N) → Company(创建者, company_admins)

┌──────────┐     ┌──────────┐     ┌──────────┐
│   User   │────<│ Company  │────<│  Team    │
│  用户表   │     │  公司表   │     │  团队表   │
│(含运营角色)│     │(资质主体) │     │(施工班组) │
└────┬─────┘     └──────────┘     └────┬─────┘
     │                                 │
     │ 1:N(员工归属)                    │
     └─────────────────────────────────┘
                    │
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Demand  │>────│  Quote   │<─────────┘
│  需求表   │     │  报价表   │
│(含图片字段)│     └──────────┘
└────┬─────┘
     │ 1:1
     ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Order   │>────│  Log     │     │  Review  │
│  订单表   │     │ 施工日志  │     │  评价表   │
└────┬─────┘     │(含图片视频)│     └──────────┘
     │           └──────────┘
     │ 1:N
     ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Message  │     │  Case    │     │   File   │
│ 留言表   │     │  案例表   │     │  文件表   │
│(含图片字段)│     │(含图片字段)│     │(仅存文件) │
└──────────┘     └──────────┘     └──────────┘

┌──────────┐     ┌──────────┐
│Compliance│     │  Event   │
│ 合规模板  │     │ 事件日志  │
│(PDF文件) │     │(详细detail)│
└──────────┘     └──────────┘

文件存储策略：
- 实体表（demands/logs/messages/cases等）直接存储 file_ids (JSON数组) 关联文件
- files 表仅存储文件元信息（URL、大小、类型等），不存储业务关联
- 查询主表时通过 file_ids 关联获取文件列表，避免跨表JOIN
```

### 3.2 核心表结构设计

#### 3.2.1 用户表 (users)

```sql
CREATE TABLE users (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  open_id         VARCHAR(64) DEFAULT NULL COMMENT '微信openId',
  union_id        VARCHAR(64) DEFAULT NULL COMMENT '微信unionId',
  phone           VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  nickname        VARCHAR(50) DEFAULT NULL COMMENT '昵称',
  avatar_url      VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
  -- 角色体系
  role            TINYINT NOT NULL DEFAULT 1 COMMENT '角色: 1=需求方 2=服务方(员工) 3=平台运营',
  current_role    TINYINT NOT NULL DEFAULT 1 COMMENT '当前使用的角色',
  -- 服务方员工信息（role=2时填写）
  real_name       VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
  gender          TINYINT DEFAULT NULL COMMENT '性别: 0=未知 1=男 2=女',
  age             INT DEFAULT NULL COMMENT '年龄',
  id_card_no      VARCHAR(18) DEFAULT NULL COMMENT '身份证号(加密存储)',
  id_card_images  JSON DEFAULT NULL COMMENT '证件照片文件ID数组 [file_id,...]',
  qualification_level TINYINT DEFAULT NULL COMMENT '资质等级: 1=初级 2=中级 3=高级 4=特级',
  work_years      INT DEFAULT NULL COMMENT '工龄(年)',
  team_id         BIGINT DEFAULT NULL COMMENT '所属团队ID(服务方员工)',
  is_team_admin   TINYINT NOT NULL DEFAULT 0 COMMENT '是否团队管理员: 0=否 1=是',
  -- 公司管理员关联（可管理多个公司）
  -- 通过 company_admins 表关联
  -- 平台运营人员（role=3）
  password_hash   VARCHAR(255) DEFAULT NULL COMMENT '密码哈希(运营人员登录用)',
  secret_key      VARCHAR(128) DEFAULT NULL COMMENT 'API密钥(运营人员接口调用用)',
  -- 通用字段
  status          TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0=禁用 1=正常',
  last_login_at   DATETIME DEFAULT NULL COMMENT '最后登录时间',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_open_id (open_id),
  KEY idx_phone (phone),
  KEY idx_team_id (team_id),
  KEY idx_role (role)
) ENGINE=InnoDB COMMENT='用户表';
```

#### 3.2.2 公司管理员关联表 (company_admins)

```sql
CREATE TABLE company_admins (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id      BIGINT NOT NULL COMMENT '公司ID',
  user_id         BIGINT NOT NULL COMMENT '管理员用户ID',
  role            TINYINT NOT NULL DEFAULT 1 COMMENT '角色: 1=创建者 2=管理员',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_company_user (company_id, user_id),
  KEY idx_user_id (user_id)
) ENGINE=InnoDB COMMENT='公司管理员关联表';
```

#### 3.2.3 公司表 (companies)

```sql
CREATE TABLE companies (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(100) NOT NULL COMMENT '公司名称',
  contact_person  VARCHAR(50) NOT NULL COMMENT '联系人',
  contact_phone   VARCHAR(20) NOT NULL COMMENT '联系电话',
  -- 资质信息
  license_no      VARCHAR(100) DEFAULT NULL COMMENT '营业执照编号',
  license_images  JSON DEFAULT NULL COMMENT '营业执照图片文件ID数组 [file_id,...]',
  qualification   VARCHAR(50) DEFAULT NULL COMMENT '资质等级',
  qualification_images JSON DEFAULT NULL COMMENT '资质证书图片文件ID数组 [file_id,...]',
  safety_cert_no  VARCHAR(100) DEFAULT NULL COMMENT '安全生产许可证编号',
  safety_cert_images JSON DEFAULT NULL COMMENT '安全生产许可证图片文件ID数组 [file_id,...]',
  established_at  DATE DEFAULT NULL COMMENT '成立日期',
  description     TEXT DEFAULT NULL COMMENT '公司简介',
  service_area    VARCHAR(500) DEFAULT NULL COMMENT '服务区域(JSON数组,上海各区)',
  completed_count INT NOT NULL DEFAULT 0 COMMENT '累计完成项目数(所有团队合计)',
  team_count      INT NOT NULL DEFAULT 0 COMMENT '下属团队数量',
  -- 审核状态
  verify_status   TINYINT NOT NULL DEFAULT 0 COMMENT '认证状态: 0=待审核 1=已认证 2=审核拒绝',
  verify_remark   VARCHAR(500) DEFAULT NULL COMMENT '审核备注',
  status          TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0=禁用 1=正常',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_verify_status (verify_status)
) ENGINE=InnoDB COMMENT='公司表(资质主体，不直接关联user)';
```

#### 3.2.4 团队表 (teams)

```sql
CREATE TABLE teams (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id      BIGINT NOT NULL COMMENT '所属公司ID',
  name            VARCHAR(100) NOT NULL COMMENT '团队名称(施工班组)',
  -- AB角负责人
  leader_a_name   VARCHAR(50) NOT NULL COMMENT 'A角负责人姓名',
  leader_a_phone  VARCHAR(20) NOT NULL COMMENT 'A角负责人电话',
  leader_b_name   VARCHAR(50) DEFAULT NULL COMMENT 'B角负责人姓名',
  leader_b_phone  VARCHAR(20) DEFAULT NULL COMMENT 'B角负责人电话',
  team_size       INT NOT NULL DEFAULT 1 COMMENT '团队规模(人)',
  specialties     VARCHAR(500) DEFAULT NULL COMMENT '擅长类型(JSON数组: [1,2,3])',
  description     TEXT DEFAULT NULL COMMENT '团队简介',
  service_area    VARCHAR(500) DEFAULT NULL COMMENT '服务区域(JSON数组,上海各区,默认继承公司)',
  completed_count INT NOT NULL DEFAULT 0 COMMENT '累计完成项目数',
  avg_rating      DECIMAL(2,1) NOT NULL DEFAULT 0.0 COMMENT '平均评分',
  review_count    INT NOT NULL DEFAULT 0 COMMENT '评价总数',
  status          TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0=禁用 1=正常',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_company_id (company_id)
) ENGINE=InnoDB COMMENT='团队表(公司下属施工班组，AB角双负责人)';
```

#### 3.2.5 需求表 (demands)

```sql
CREATE TABLE demands (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  demand_no       VARCHAR(32) NOT NULL COMMENT '需求编号(业务流水号)',
  user_id         BIGINT NOT NULL COMMENT '发布人(需求方)用户ID',
  demo_type       TINYINT NOT NULL COMMENT '拆除类型: 1=室内 2=店面 3=围墙 4=小型构筑物 5=管道 6=其他',
  title           VARCHAR(200) NOT NULL COMMENT '需求标题',
  description     TEXT DEFAULT NULL COMMENT '详细描述',
  address         VARCHAR(300) NOT NULL COMMENT '详细地址',
  district        VARCHAR(50) NOT NULL COMMENT '所在区(上海16区)',
  longitude       DECIMAL(10,7) DEFAULT NULL COMMENT '经度',
  latitude        DECIMAL(10,7) DEFAULT NULL COMMENT '纬度',
  area            DECIMAL(10,2) DEFAULT NULL COMMENT '面积(平方米)',
  floor           VARCHAR(20) DEFAULT NULL COMMENT '楼层信息',
  expected_time   VARCHAR(100) DEFAULT NULL COMMENT '期望施工时间',
  -- 图片资源：现场照片、平面结构图、拆除施工图等
  image_ids       JSON DEFAULT NULL COMMENT '图片文件ID数组 [file_id,...]，可包含现场照片/平面图/施工图等',
  -- 状态与报价
  status          TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0=待抢单 1=报价审核中 2=已推荐报价 3=已选团队 4=施工中 5=待验收 6=已完成 7=已取消',
  selected_quote_ids JSON DEFAULT NULL COMMENT '选中的报价ID数组 [quote_id,...]，支持客户选择多个报价方案',
  quote_count     INT NOT NULL DEFAULT 0 COMMENT '报价数量',
  view_count      INT NOT NULL DEFAULT 0 COMMENT '浏览次数',
  -- 过期规则：发布后7天未收到任何报价自动过期，过期后状态变为已取消
  expired_at      DATETIME NOT NULL COMMENT '需求过期时间(发布时间+7天)',
  completed_at    DATETIME DEFAULT NULL COMMENT '完成时间',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_demand_no (demand_no),
  KEY idx_user_id (user_id),
  KEY idx_status (status),
  KEY idx_district (district),
  KEY idx_demo_type (demo_type),
  KEY idx_expired_at (expired_at)
) ENGINE=InnoDB COMMENT='需求表';
```

#### 3.2.6 报价表 (quotes)

```sql
CREATE TABLE quotes (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  quote_no        VARCHAR(32) NOT NULL COMMENT '报价编号',
  demand_id       BIGINT NOT NULL COMMENT '需求ID',
  team_id         BIGINT NOT NULL COMMENT '报价团队ID',
  company_id      BIGINT NOT NULL COMMENT '报价公司ID(冗余，方便查询)',
  price           DECIMAL(12,2) NOT NULL COMMENT '报价金额(元)',
  duration        INT DEFAULT NULL COMMENT '预计工期(天)',
  plan_summary    TEXT DEFAULT NULL COMMENT '施工方案简述',
  remark          VARCHAR(500) DEFAULT NULL COMMENT '补充说明',
  status          TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0=待审核 1=审核通过 2=审核拒绝 3=被客户拒绝 4=被选中',
  review_remark   VARCHAR(500) DEFAULT NULL COMMENT '审核备注',
  reviewed_at     DATETIME DEFAULT NULL COMMENT '审核时间',
  reviewed_by     BIGINT DEFAULT NULL COMMENT '审核人(运营人员)ID',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_quote_no (quote_no),
  KEY idx_demand_id (demand_id),
  KEY idx_team_id (team_id),
  KEY idx_company_id (company_id),
  KEY idx_status (status)
) ENGINE=InnoDB COMMENT='报价表';
```

#### 3.2.7 订单表 (orders)

```sql
CREATE TABLE orders (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_no        VARCHAR(32) NOT NULL COMMENT '订单编号',
  demand_id       BIGINT NOT NULL COMMENT '需求ID',
  user_id         BIGINT NOT NULL COMMENT '需求方用户ID',
  team_id         BIGINT NOT NULL COMMENT '服务方团队ID',
  company_id      BIGINT NOT NULL COMMENT '服务方公司ID(冗余)',
  quote_ids       JSON NOT NULL COMMENT '选中的报价ID数组 [quote_id,...]',
  final_price     DECIMAL(12,2) DEFAULT NULL COMMENT '最终成交价',
  status          TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0=待确认(服务方创建) 1=施工中 2=待验收 3=已完成 4=已取消',
  confirmed_at    DATETIME DEFAULT NULL COMMENT '需求方确认合作时间',
  started_at      DATETIME DEFAULT NULL COMMENT '开始施工时间',
  completed_at    DATETIME DEFAULT NULL COMMENT '完工时间',
  accepted_at     DATETIME DEFAULT NULL COMMENT '验收时间',
  created_by      BIGINT NOT NULL COMMENT '创建人(服务方)用户ID',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_order_no (order_no),
  KEY idx_demand_id (demand_id),
  KEY idx_user_id (user_id),
  KEY idx_team_id (team_id),
  KEY idx_company_id (company_id),
  KEY idx_status (status)
) ENGINE=InnoDB COMMENT='订单表(由服务方创建，需求方确认)';
```

#### 3.2.8 施工日志表 (construction_logs)

```sql
CREATE TABLE construction_logs (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id        BIGINT NOT NULL COMMENT '订单ID',
  team_id         BIGINT NOT NULL COMMENT '上传团队ID',
  log_date        DATE NOT NULL COMMENT '日志日期',
  content         TEXT NOT NULL COMMENT '日志内容(文字描述)',
  progress        TINYINT DEFAULT NULL COMMENT '施工进度百分比(0-100)',
  workers         INT DEFAULT NULL COMMENT '当日施工人数',
  -- 多媒体：每天可上传多张图片和视频
  image_ids       JSON DEFAULT NULL COMMENT '图片文件ID数组 [file_id,...]，支持多张',
  video_ids       JSON DEFAULT NULL COMMENT '视频文件ID数组 [file_id,...]，支持多个',
  -- 异常标记
  is_abnormal     TINYINT NOT NULL DEFAULT 0 COMMENT '是否异常: 0=正常 1=异常',
  abnormal_desc   VARCHAR(500) DEFAULT NULL COMMENT '异常描述',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_order_id (order_id),
  KEY idx_log_date (log_date),
  UNIQUE KEY uk_order_date (order_id, log_date)
) ENGINE=InnoDB COMMENT='施工日志表(支持每天多图多视频)';
```

#### 3.2.9 留言表 (messages)

```sql
CREATE TABLE messages (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id        BIGINT NOT NULL COMMENT '订单ID',
  sender_id       BIGINT NOT NULL COMMENT '发送者用户ID',
  sender_role     TINYINT NOT NULL COMMENT '发送者角色: 1=需求方 2=服务方',
  receiver_id     BIGINT NOT NULL COMMENT '接收者用户ID',
  content         TEXT DEFAULT NULL COMMENT '留言文字内容',
  image_ids       JSON DEFAULT NULL COMMENT '图片文件ID数组 [file_id,...]，支持文字+图片混合留言',
  is_read         TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读: 0=未读 1=已读',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_order_id (order_id),
  KEY idx_sender_id (sender_id),
  KEY idx_receiver_id (receiver_id)
) ENGINE=InnoDB COMMENT='留言表(支持文字+图片)';
```

#### 3.2.10 评价表 (reviews)

```sql
CREATE TABLE reviews (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id        BIGINT NOT NULL COMMENT '订单ID',
  user_id         BIGINT NOT NULL COMMENT '评价人(需求方)用户ID',
  team_id         BIGINT NOT NULL COMMENT '被评价团队ID',
  rating          TINYINT NOT NULL COMMENT '评分(1-5)',
  content         VARCHAR(1000) DEFAULT NULL COMMENT '评价内容',
  image_ids       JSON DEFAULT NULL COMMENT '评价图片文件ID数组 [file_id,...]',
  reply_content   VARCHAR(1000) DEFAULT NULL COMMENT '团队回复内容',
  status          TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0=隐藏 1=显示',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_order_id (order_id),
  KEY idx_team_id (team_id)
) ENGINE=InnoDB COMMENT='评价表';
```

#### 3.2.11 案例表 (cases)

```sql
CREATE TABLE cases (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  team_id         BIGINT NOT NULL COMMENT '所属团队ID',
  company_id      BIGINT NOT NULL COMMENT '所属公司ID(冗余)',
  title           VARCHAR(200) NOT NULL COMMENT '案例标题',
  demo_type       TINYINT NOT NULL COMMENT '拆除类型',
  description     TEXT DEFAULT NULL COMMENT '案例描述',
  address         VARCHAR(300) DEFAULT NULL COMMENT '项目地址(可模糊)',
  area            DECIMAL(10,2) DEFAULT NULL COMMENT '面积(平方米)',
  duration        INT DEFAULT NULL COMMENT '工期(天)',
  -- 多张图片，带排序
  before_image_ids  JSON DEFAULT NULL COMMENT '施工前图片文件ID数组 [file_id,...]，按sort_order排序',
  after_image_ids   JSON DEFAULT NULL COMMENT '施工后图片文件ID数组 [file_id,...]，按sort_order排序',
  status          TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0=待审核 1=已发布 2=审核拒绝',
  view_count      INT NOT NULL DEFAULT 0 COMMENT '浏览次数',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_team_id (team_id),
  KEY idx_company_id (company_id),
  KEY idx_demo_type (demo_type)
) ENGINE=InnoDB COMMENT='案例表(施工前后对比图，多张带排序)';
```

#### 3.2.12 文件表 (files)

> **设计原则**：files 表仅存储文件元信息，不存储业务关联关系。业务实体通过 `file_ids` (JSON数组) 字段直接引用文件ID。

```sql
CREATE TABLE files (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  file_type       TINYINT NOT NULL COMMENT '文件类型: 1=图片 2=视频 3=文档(PDF等)',
  file_name       VARCHAR(200) NOT NULL COMMENT '原始文件名',
  file_url        VARCHAR(500) NOT NULL COMMENT 'OSS文件URL',
  file_size       BIGINT DEFAULT NULL COMMENT '文件大小(字节)',
  mime_type       VARCHAR(100) DEFAULT NULL COMMENT 'MIME类型',
  width           INT DEFAULT NULL COMMENT '图片宽度(像素，仅图片)',
  height          INT DEFAULT NULL COMMENT '图片高度(像素，仅图片)',
  duration        INT DEFAULT NULL COMMENT '视频时长(秒，仅视频)',
  sort_order      INT NOT NULL DEFAULT 0 COMMENT '排序号',
  uploader_id     BIGINT DEFAULT NULL COMMENT '上传者用户ID',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_uploader (uploader_id)
) ENGINE=InnoDB COMMENT='文件表(仅存文件元信息，业务关联在实体表中通过file_ids引用)';
```

#### 3.2.13 合规模板表 (compliance_docs)

```sql
CREATE TABLE compliance_docs (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  title           VARCHAR(200) NOT NULL COMMENT '文档标题',
  category        VARCHAR(50) NOT NULL COMMENT '分类: 备案流程/材料清单/政策法规/施工方案模板',
  description     VARCHAR(500) DEFAULT NULL COMMENT '文档摘要说明',
  file_id         BIGINT DEFAULT NULL COMMENT 'PDF文件ID(关联files表)',
  file_url        VARCHAR(500) DEFAULT NULL COMMENT 'PDF文件URL(冗余，方便直接访问)',
  sort_order      INT NOT NULL DEFAULT 0 COMMENT '排序号',
  status          TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0=下架 1=上架',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_category (category)
) ENGINE=InnoDB COMMENT='合规模板表(文档内容为PDF文件)';
```

#### 3.2.14 事件日志表 (event_logs)

```sql
CREATE TABLE event_logs (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  biz_type        VARCHAR(30) NOT NULL COMMENT '业务类型',
  biz_id          BIGINT NOT NULL COMMENT '业务ID',
  event_type      VARCHAR(50) NOT NULL COMMENT '事件类型',
  operator_id     BIGINT DEFAULT NULL COMMENT '操作人ID',
  detail          JSON DEFAULT NULL COMMENT '事件详情(见下方detail结构定义)',
  ip              VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_biz (biz_type, biz_id),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB COMMENT='事件日志表(数据采集)';
```

**事件日志 detail 结构定义：**

```json
// ═══════ 用户事件 (biz_type=user) ═══════
// event_type: registered
{ "method": "wechat", "role": 1, "phone": "138****1234" }

// event_type: role_switched
{ "from_role": 1, "to_role": 2 }

// event_type: team_joined (员工选择所属团队)
{ "team_id": 100, "team_name": "拆除一组" }

// event_type: profile_updated
{ "fields": ["real_name", "phone", "qualification_level"] }

// event_type: status_changed
{ "from_status": 1, "to_status": 0, "reason": "违规操作" }

// ═══════ 公司事件 (biz_type=company) ═══════
// event_type: created
{ "name": "XX拆除有限公司", "creator_id": 10, "creator_name": "张三" }

// event_type: verify_passed
{ "reviewer_id": 1, "reviewer_name": "运营小李" }

// event_type: verify_rejected
{ "reviewer_id": 1, "reviewer_name": "运营小李", "reason": "营业执照模糊" }

// event_type: info_updated
{ "fields": ["contact_phone", "service_area"] }

// ═══════ 团队事件 (biz_type=team) ═══════
// event_type: created
{ "company_id": 5, "team_name": "拆除一组", "leader_a": "张三", "leader_b": "李四" }

// event_type: updated
{ "fields": ["leader_a_name", "team_size", "specialties"] }

// event_type: status_changed
{ "from_status": 1, "to_status": 0, "reason": "团队解散" }

// ═══════ 需求事件 (biz_type=demand) ═══════
// event_type: created
{ "demand_no": "DM20260428000001", "demo_type": 1, "district": "浦东新区", "area": 120.5 }

// event_type: status_changed
{ "from_status": 0, "to_status": 1, "reason": "收到首个报价" }

// event_type: expired
{ "reason": "7天未收到报价，自动过期" }

// event_type: cancelled
{ "reason": "客户主动取消", "operator_id": 20 }

// event_type: quotes_selected
{ "selected_quote_ids": [101, 102], "selected_team_ids": [5, 8] }

// ═══════ 报价事件 (biz_type=quote) ═══════
// event_type: created
{ "quote_no": "QT20260428000001", "demand_id": 50, "team_id": 5, "price": 15000, "duration": 3 }

// event_type: reviewed
{ "action": "passed", "reviewer_id": 1, "reviewer_name": "运营小李" }
{ "action": "rejected", "reviewer_id": 1, "reviewer_name": "运营小李", "reason": "报价过低" }

// event_type: selected
{ "selected_by": "需求方", "user_id": 20 }

// ═══════ 订单事件 (biz_type=order) ═══════
// event_type: created
{ "order_no": "OD20260428000001", "demand_id": 50, "team_id": 5, "quote_ids": [101], "created_by": 30 }

// event_type: confirmed (需求方确认合作)
{ "user_id": 20, "confirmed_at": "2026-04-28 14:00:00" }

// event_type: started (开始施工)
{ "operator_id": 30, "started_at": "2026-04-29 08:00:00" }

// event_type: completed (标记完工)
{ "operator_id": 30, "completed_at": "2026-05-01 17:00:00" }

// event_type: accepted (验收确认)
{ "user_id": 20, "accepted_at": "2026-05-02 10:00:00" }

// event_type: cancelled
{ "reason": "双方协商取消", "operator_id": 20 }

// ═══════ 施工日志事件 (biz_type=log) ═══════
// event_type: created
{ "order_id": 80, "log_date": "2026-04-29", "image_count": 5, "video_count": 1, "progress": 30 }

// event_type: updated
{ "fields": ["content", "image_ids"], "image_count": 8 }

// event_type: abnormal_reported
{ "abnormal_desc": "发现隐蔽管线，已通知客户" }

// ═══════ 留言事件 (biz_type=message) ═══════
// event_type: sent
{ "order_id": 80, "sender_role": 2, "has_image": true, "image_count": 2 }

// ═══════ 评价事件 (biz_type=review) ═══════
// event_type: created
{ "order_id": 80, "team_id": 5, "rating": 5, "has_image": false }

// event_type: replied
{ "reply_content_length": 120 }

// ═══════ 案例事件 (biz_type=case) ═══════
// event_type: created
{ "team_id": 5, "demo_type": 1, "before_image_count": 3, "after_image_count": 3 }

// event_type: reviewed
{ "action": "passed" }
{ "action": "rejected", "reason": "图片不清晰" }

// ═══════ 合规模板事件 (biz_type=compliance) ═══════
// event_type: created
{ "title": "拆除工程备案流程指引", "category": "备案流程", "file_id": 200 }

// event_type: updated
{ "fields": ["title", "file_id"] }

// event_type: status_changed
{ "from_status": 1, "to_status": 0 }
```

---

## 四、API 接口设计

### 4.1 接口规范

**基础约定：**
- 基础路径：`/api/v1`
- 认证方式：JWT Token（微信登录后签发）
- 请求格式：`Content-Type: application/json`
- 响应格式：

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

**状态码规范：**

| code | 含义 |
|------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未登录/Token过期 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

**分页规范：**
```
GET /api/v1/xxx?page=1&pageSize=20

响应:
{
  "code": 200,
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

### 4.2 核心接口清单

#### 4.2.1 用户模块

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| POST | `/auth/wechat-login` | 微信登录（code换token） | 公开 |
| GET | `/user/profile` | 获取当前用户信息 | 登录 |
| PUT | `/user/profile` | 更新用户信息 | 登录 |
| PUT | `/user/role` | 切换当前角色 | 登录 |
| POST | `/user/phone` | 绑定手机号 | 登录 |

#### 4.2.2 公司模块

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| POST | `/company/register` | 公司注册/入驻申请 | 服务方 |
| PUT | `/company/profile` | 更新公司信息 | 服务方 |
| GET | `/company/profile` | 获取我的公司信息 | 服务方 |
| GET | `/company/{id}` | 获取公司公开信息 | 公开 |

#### 4.2.3 团队模块

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| POST | `/team` | 创建团队（公司下） | 服务方 |
| PUT | `/team/{id}` | 编辑团队信息 | 服务方 |
| DELETE | `/team/{id}` | 停用/删除团队 | 服务方 |
| GET | `/team/list` | 我的公司下团队列表 | 服务方 |
| GET | `/team/{id}` | 获取团队公开信息（主页） | 公开 |
| GET | `/team/{id}/cases` | 获取团队案例列表 | 公开 |
| GET | `/team/{id}/reviews` | 获取团队评价列表 | 公开 |
| POST | `/team/{id}/case` | 上传案例 | 服务方 |
| PUT | `/team/{id}/case/{caseId}` | 编辑案例 | 服务方 |
| DELETE | `/team/{id}/case/{caseId}` | 删除案例 | 服务方 |

#### 4.2.4 需求模块

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| POST | `/demand` | 发布需求 | 需求方 |
| GET | `/demand/{id}` | 获取需求详情 | 登录 |
| GET | `/demand/my` | 我发布的需求列表 | 需求方 |
| PUT | `/demand/{id}` | 编辑需求（仅待抢单状态） | 需求方 |
| PUT | `/demand/{id}/cancel` | 取消需求 | 需求方 |
| GET | `/demand/hall` | 抢单大厅（需求列表） | 服务方 |
| GET | `/demand/{id}/quotes` | 获取需求的报价列表 | 需求方 |

#### 4.2.5 报价模块

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| POST | `/quote` | 提交报价 | 服务方 |
| GET | `/quote/my` | 我的报价列表 | 服务方 |
| GET | `/quote/{id}` | 报价详情 | 登录 |
| PUT | `/demand/{id}/select-quote` | 客户选择报价 | 需求方 |

#### 4.2.6 订单模块

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| POST | `/order` | **创建订单**（服务方基于选中报价创建订单，需求方确认合作） | 服务方 |
| GET | `/order/{id}` | 订单详情 | 登录 |
| GET | `/order/my` | 我的订单列表 | 登录 |
| PUT | `/order/{id}/confirm` | 确认合作（需求方确认服务方创建的订单） | 需求方 |
| PUT | `/order/{id}/start` | 开始施工（服务方） | 服务方 |
| PUT | `/order/{id}/complete` | 标记完工（服务方） | 服务方 |
| PUT | `/order/{id}/accept` | 验收确认（需求方） | 需求方 |
| PUT | `/order/{id}/cancel` | 取消订单 | 双方 |

#### 4.2.7 施工日志模块

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| POST | `/log` | 上传施工日志 | 服务方 |
| GET | `/log/order/{orderId}` | 获取订单施工日志列表 | 登录 |
| GET | `/log/{id}` | 日志详情 | 登录 |
| PUT | `/log/{id}` | 编辑日志 | 服务方 |

#### 4.2.8 留言模块

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| GET | `/message/order/{orderId}` | 获取订单留言列表 | 登录 |
| POST | `/message/order/{orderId}` | 发送留言 | 登录 |
| PUT | `/message/read/{orderId}` | 标记已读 | 登录 |
| GET | `/message/unread-count` | 未读留言数量 | 登录 |

#### 4.2.9 评价模块

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| POST | `/review` | 提交评价 | 需求方 |
| GET | `/review/order/{orderId}` | 获取订单评价 | 登录 |
| POST | `/review/{id}/reply` | 团队回复评价 | 服务方 |

#### 4.2.10 合规模板模块

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| GET | `/compliance/list` | 合规模板列表（按分类） | 公开 |
| GET | `/compliance/{id}` | 合规模板详情 | 公开 |

#### 4.2.11 文件上传模块

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| POST | `/file/upload` | 上传文件（图片/视频/文档） | 登录 |
| DELETE | `/file/{id}` | 删除文件 | 登录 |

#### 4.2.12 Web后台管理接口

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| POST | `/admin/auth/login` | 后台登录 | 运营 |
| GET | `/admin/users` | 用户管理列表 | 运营 |
| PUT | `/admin/users/{id}/status` | 启用/禁用用户 | 运营 |
| GET | `/admin/companies` | 公司管理列表 | 运营 |
| PUT | `/admin/companies/{id}/verify` | 审核公司资质 | 运营 |
| GET | `/admin/companies/{id}/teams` | 查看公司下属团队 | 运营 |
| GET | `/admin/teams` | 团队管理列表 | 运营 |
| PUT | `/admin/teams/{id}/status` | 启用/禁用团队 | 运营 |
| GET | `/admin/demands` | 需求管理列表 | 运营 |
| PUT | `/admin/demands/{id}/status` | 审核需求 | 运营 |
| GET | `/admin/quotes` | 报价管理列表 | 运营 |
| PUT | `/admin/quotes/{id}/review` | 审核报价 | 运营 |
| GET | `/admin/orders` | 订单管理列表 | 运营 |
| GET | `/admin/logs` | 施工日志监控 | 运营 |
| GET | `/admin/compliance` | 合规模板管理 | 运营 |
| POST | `/admin/compliance` | 新增合规模板 | 运营 |
| PUT | `/admin/compliance/{id}` | 编辑合规模板 | 运营 |
| DELETE | `/admin/compliance/{id}` | 删除合规模板 | 运营 |
| GET | `/admin/cases` | 案例管理列表 | 运营 |
| PUT | `/admin/cases/{id}/status` | 审核案例 | 运营 |
| GET | `/admin/dashboard` | 数据看板统计 | 运营 |

---

## 五、页面结构设计

### 5.1 小程序端页面结构

```
小程序
├── 启动页 (splash)
├── 登录页 (login) ─── 微信授权登录 / 运营人员账号密码登录
├── 角色选择页 (role-select) ─── 首次登录选择角色（需求方/服务方）
├── 服务方首次登录引导 (pages/provider/onboarding)
│   ├── Step1: 填写实名制信息（姓名、身份证、证件照片）
│   ├── Step2: 填写个人信息（性别、年龄、工龄、资质等级）
│   └── Step3: 选择所属公司/团队（已有公司→选团队；无公司→引导创建公司）
│
├── ═══════ 需求方视图 ═══════
│   ├── TabBar首页 (pages/demander/home)
│   │   ├── 搜索栏
│   │   ├── 拆除类型快捷入口（6类）
│   │   ├── 合规知识入口
│   │   ├── 推荐团队列表
│   │   └── 精选案例展示
│   │
│   ├── 发布需求 (pages/demander/publish)
│   │   ├── Step1: 选择拆除类型
│   │   ├── Step2: 填写信息（地址/面积/描述/期望时间）
│   │   └── Step3: 上传现场照片
│   │
│   ├── 我的需求 (pages/demander/my-demands)
│   │   ├── Tab: 全部 / 待抢单 / 报价中 / 施工中 / 已完成
│   │   └── 需求卡片列表
│   │
│   ├── 需求详情 (pages/demander/demand-detail)
│   │   ├── 需求信息展示
│   │   ├── 报价列表（审核通过的报价）
│   │   ├── 报价对比（价格/工期/方案）
│   │   └── 操作：选择报价 / 取消需求
│   │
│   ├── 订单详情 (pages/demander/order-detail)
│   │   ├── 订单信息
│   │   ├── 团队信息 + 联系方式
│   │   ├── 施工日志时间线
│   │   ├── 留言板
│   │   └── 操作：确认合作 / 验收 / 评价
│   │
│   ├── 施工日志查看 (pages/demander/log-timeline)
│   │   ├── 日期时间线
│   │   └── 每日日志详情（文字+图片+视频）
│   │
│   ├── 评价页 (pages/demander/review)
│   │   ├── 评分（1-5星）
│   │   └── 文字评价
│   │
│   ├── 团队主页 (pages/team/team-home)
│   │   ├── 团队信息（资质/规模/擅长）
│   │   ├── 认证标识
│   │   ├── 案例展示墙
│   │   └── 评价列表
│   │
│   ├── 案例列表 (pages/case/case-list)
│   │   └── 案例卡片（施工前后对比图）
│   │
│   ├── 合规知识 (pages/compliance/list)
│   │   ├── 分类Tab：备案流程 / 材料清单 / 政策法规 / 模板下载
│   │   └── 文档详情（富文本）
│   │
│   └── TabBar我的 (pages/demander/profile)
│       ├── 个人信息
│       ├── 角色切换入口
│       ├── 我的需求
│       ├── 我的订单
│       ├── 我的评价
│       └── 联系客服
│
├── ═══════ 服务方视图 ═══════
│   ├── TabBar首页/接单大厅 (pages/provider/hall)
│   │   ├── 搜索栏 + 筛选（区域/类型）
│   │   ├── 需求卡片列表
│   │   └── 需求详情入口
│   │
│   ├── 公司管理 (pages/provider/company)
│   │   ├── 创建公司入口（任何服务方用户均可创建）
│   │   ├── 公司信息展示/编辑
│   │   ├── 资质证书管理（上传/查看营业执照、资质证书、安全许可证）
│   │   ├── 认证状态展示（待审核/已认证/审核拒绝）
│   │   └── 公司管理员管理（添加/移除管理员）
│   │
│   ├── 团队管理 (pages/provider/team-manage)
│   │   ├── ⚠️ 权限控制：仅公司管理员可创建团队
│   │   ├── ⚠️ 前置条件：公司资质审核通过(verify_status=1)后才可创建团队
│   │   ├── 团队列表（公司下所有班组）
│   │   ├── 创建/编辑团队（AB角负责人信息）
│   │   ├── 团队成员查看
│   │   └── 案例管理（增删改）
│   │
│   ├── 员工信息 (pages/provider/employee)
│   │   ├── 实名制信息填写（真实姓名、身份证、证件照片）
│   │   ├── 个人信息（性别、年龄、工龄、资质等级）
│   │   └── 所属团队选择（首次登录引导）
│   │
│   ├── 需求详情 (pages/provider/demand-detail)
│   │   ├── 需求信息
│   │   ├── 现场照片
│   │   └── 操作：提交报价
│   │
│   ├── 提交报价 (pages/provider/submit-quote)
│   │   ├── 报价金额
│   │   ├── 预计工期
│   │   └── 施工方案简述
│   │
│   ├── 我的报价 (pages/provider/my-quotes)
│   │   ├── Tab: 全部 / 待审核 / 已通过 / 已拒绝 / 已选中
│   │   └── 报价卡片列表
│   │
│   ├── 我的订单 (pages/provider/my-orders)
│   │   ├── Tab: 全部 / 待确认 / 施工中 / 待验收 / 已完成
│   │   └── 订单卡片列表
│   │
│   ├── 订单详情 (pages/provider/order-detail)
│   │   ├── 订单信息
│   │   ├── 客户信息 + 联系方式
│   │   ├── 施工日志列表
│   │   ├── 留言板
│   │   └── 操作：开始施工 / 上传日志 / 标记完工
│   │
│   ├── 上传施工日志 (pages/provider/upload-log)
│   │   ├── 日期选择
│   │   ├── 工作内容（文字）
│   │   ├── 施工进度
│   │   ├── 施工人数
│   │   ├── 图片上传（施工前后对比）
│   │   ├── 视频上传
│   │   └── 异常情况标记
│   │
│   ├── 上传案例 (pages/provider/upload-case)
│   │   ├── 案例信息
│   │   ├── 施工前照片
│   │   └── 施工后照片
│   │
│   └── TabBar我的 (pages/provider/profile)
│       ├── 团队信息
│       ├── 角色切换入口
│       ├── 我的报价
│       ├── 我的订单
│       └── 联系客服
│
└── ═══════ 公共页面 ═══════
    ├── 留言板 (pages/common/message-board)
    │   ├── 留言列表
    │   └── 发送留言（文字+图片）
    ├── 文件预览 (pages/common/file-preview)
    ├── 通知列表 (pages/common/notifications)
    └── Webview (pages/common/webview)
```

### 5.2 Web后台页面结构

```
Web后台管理系统
├── 登录页 (/login)
│
├── 仪表盘 (/dashboard)
│   ├── 核心指标卡片（今日新增需求/报价/订单/用户）
│   ├── 趋势图表（需求量/成交量趋势）
│   └── 待办事项（待审核资质/待审核报价/待处理投诉）
│
├── 用户管理 (/users)
│   ├── 用户列表（搜索/筛选/分页）
│   ├── 用户详情
│   └── 启用/禁用操作
│
├── 公司管理 (/companies)
│   ├── 公司列表
│   ├── 资质审核（查看证照/通过/拒绝）
│   ├── 公司详情
│   ├── 查看下属团队列表
│   └── 启用/禁用操作
│
├── 团队管理 (/teams)
│   ├── 团队列表（可按公司筛选）
│   ├── 团队详情
│   └── 启用/禁用操作
│
├── 需求管理 (/demands)
│   ├── 需求列表（按状态筛选）
│   ├── 需求详情
│   └── 下架/取消操作
│
├── 报价管理 (/quotes)
│   ├── 报价列表（按状态筛选）
│   ├── 报价审核（查看详情/通过/拒绝/备注）
│   └── 报价详情
│
├── 订单管理 (/orders)
│   ├── 订单列表（按状态筛选）
│   ├── 订单详情
│   └── 施工日志查看
│
├── 案例管理 (/cases)
│   ├── 案例列表
│   ├── 案例审核（通过/拒绝）
│   └── 上/下架操作
│
├── 合规模板管理 (/compliance)
│   ├── 文档列表（按分类）
│   ├── 新增文档（富文本编辑器）
│   ├── 编辑文档
│   └── 删除/上线下线
│
├── 评价管理 (/reviews)
│   ├── 评价列表
│   └── 显示/隐藏操作
│
├── 消息通知 (/notifications)
│   ├── 通知列表
│   └── 发送通知（可选）
│
└── 系统设置 (/settings)
    ├── 管理员账号管理
    ├── 角色权限配置
    └── 系统参数配置
```

---

## 六、核心业务状态机

### 6.1 需求状态流转

```
                    ┌──────────┐
                    │  已取消   │
                    │ (7)      │
                    └──────────┘
                         ▲
                         │ 取消
┌──────┐  发布  ┌──────────┐  团队报价  ┌──────────┐
│ 草稿  │─────→│ 待抢单    │─────────→│ 报价审核中 │
│      │      │ (0)      │          │ (1)      │
└──────┘      └──────────┘          └────┬─────┘
                                          │
                                    审核通过(有报价)
                                          │
                                          ▼
                                    ┌──────────┐
                                    │ 已推荐报价 │
                                    │ (2)      │
                                    └────┬─────┘
                                          │ 客户选择报价
                                          ▼
                                    ┌──────────┐
                                    │ 已选团队   │
                                    │ (3)      │
                                    └────┬─────┘
                                          │ 确认合作
                                          ▼
                                    ┌──────────┐
                                    │ 施工中     │
                                    │ (4)      │
                                    └────┬─────┘
                                          │ 标记完工
                                          ▼
                                    ┌──────────┐
                                    │ 待验收     │
                                    │ (5)      │
                                    └────┬─────┘
                                          │ 验收确认
                                          ▼
                                    ┌──────────┐
                                    │ 已完成     │
                                    │ (6)      │
                                    └──────────┘
```

### 6.2 报价状态流转

```
┌──────┐  团队提交  ┌────────┐  运营审核  ┌──────────┐
│      │─────────→│ 待审核  │─────────→│ 审核通过  │
│      │          │ (0)    │          │ (1)      │
│      │          └────────┘          └────┬─────┘
│      │                                │
│      │          ┌────────┐            │ 客户选择
│      │          │ 审核拒绝 │            ▼
│      │          │ (2)    │      ┌──────────┐
│      │          └────────┘      │ 被选中    │
│      │                           │ (4)      │
│      │                           └──────────┘
│      │
│      │          ┌────────┐
│      │          │ 被拒绝  │  (客户未选此报价)
│      │          │ (3)    │
│      │          └────────┘
```

### 6.3 订单状态流转

```
┌──────┐  服务方创建   ┌────────┐  需求方确认  ┌────────┐  服务方开始  ┌────────┐
│ 待确认 │─────────→│ 施工中  │─────────→│ 待验收  │─────────→│ 已完成  │
│ (0)  │  订单       │ (1)    │  合作      │ (2)    │  施工      │ (3)    │
└──────┘           └────────┘           └───┬────┘           └────────┘
                                              │ 需求方验收
                                              ▼
                                        ┌────────┐
                                        │ 已完成  │
                                        │ (3)    │
                                        └────────┘

说明：订单由服务方基于客户选中的报价创建，状态为"待确认"；
      需求方确认合作后状态变为"施工中"。
```

---

## 七、安全与合规方案

### 7.1 认证与授权

| 层面 | 方案 | 说明 |
|------|------|------|
| **小程序登录** | 微信 `wx.login` → code → 后端换 `openId` → 签发JWT | 需求方/服务方 |
| **Web后台登录** | 账号密码登录 → JWT Token | 平台运营人员(role=3) |
| **Token管理** | Access Token (2h) + Refresh Token (7d) | Redis存储黑名单 |
| **角色权限** | 基于角色的访问控制 (RBAC) | 需求方/服务方/平台运营 三种角色 |
| **公司管理权限** | 仅公司管理员(is_team_admin=1 或 company_admins关联)可创建/管理团队 | 服务方 |
| **团队创建前置** | 公司 verify_status=1(已认证) 后才可创建团队 | 服务方 |
| **接口鉴权** | Nest.js Guard 中间件 | 统一校验Token和角色 |

### 7.2 数据安全

| 措施 | 说明 |
|------|------|
| **传输加密** | 全站 HTTPS (TLS 1.2+) |
| **敏感数据** | 手机号脱敏展示（中间4位*），数据库加密存储 |
| **SQL注入防护** | ORM参数化查询 (Prisma) |
| **XSS防护** | 输入过滤 + 输出转义 |
| **文件上传** | 类型白名单 + 大小限制 + OSS签名URL |
| **接口限流** | Nginx限流 + Redis令牌桶算法 |

### 7.3 文件上传安全

```
限制规则:
├── 图片: jpg/jpeg/png/webp, 单张≤5MB
├── 视频: mp4, 单个≤50MB
├── 文档: pdf/doc/docx, 单个≤10MB
├── 图片上传后自动压缩（缩略图）
└── OSS Bucket私有读写，通过签名URL访问
```

### 7.4 合规要点

基于《上海市既有建筑物、构筑物拆除工程管理规定》（2025年7月1日实施）：

| 合规要求 | 系统实现 |
|---------|---------|
| 施工单位需有相应资质 | 公司入驻必须上传资质证书（营业执照/拆除资质/安全生产许可证），平台审核后展示公司认证标识 |
| 拆除工程需开工备案 | 需求发布时提示客户备案义务，合规模板库提供备案指引 |
| 文明施工（降尘降噪） | 施工日志模板包含文明施工检查项 |
| 建筑垃圾管理 | 施工日志模板包含垃圾清运记录项 |
| 实名制管理 | 团队人员信息登记（后续迭代） |
| 信用评价 | 评价体系 + 平台信用记录 |

---

## 八、消息通知设计

### 8.1 通知场景矩阵

| 触发事件 | 通知对象 | 通知方式 | 模板内容 |
|---------|---------|---------|---------|
| 新需求发布 | 所有服务方 | 微信订阅消息 | "有新的拆除需求，点击查看详情" |
| 收到新报价 | 需求方 | 微信订阅消息 | "您的需求收到新报价，点击查看" |
| 报价审核通过 | 服务方 | 微信订阅消息 | "您的报价已通过审核" |
| 报价审核拒绝 | 服务方 | 微信订阅消息 | "您的报价未通过审核，原因：{reason}" |
| 客户选择报价 | 服务方 | 微信订阅消息 | "恭喜！客户已选择您的报价" |
| 施工日志更新 | 需求方 | 微信订阅消息 | "今日施工日志已更新，点击查看" |
| 订单状态变更 | 双方 | 微信订阅消息 | "订单状态已更新为：{status}" |
| 收到新留言 | 对方 | 微信订阅消息 | "您有一条新留言" |
| 收到新评价 | 服务方 | 微信订阅消息 | "您收到一条新评价" |
| 团队认证结果 | 服务方 | 微信订阅消息 | "团队认证{result}" |

### 8.2 订阅消息模板（需在微信后台申请）

```
模板1: 新需求通知
- thing1: 拆除类型
- thing2: 所在区域
- time3: 发布时间

模板2: 新报价通知
- thing1: 需求标题
- amount2: 报价金额
- thing3: 团队名称

模板3: 施工日志更新
- thing1: 项目名称
- date2: 日志日期
- thing3: 施工内容摘要

模板4: 订单状态变更
- thing1: 订单编号
- thing2: 新状态
- thing3: 备注信息
```

---

## 九、项目目录结构

### 9.1 后端项目结构 (Nest.js)

```
server/
├── src/
│   ├── main.ts                          # 入口文件
│   ├── app.module.ts                    # 根模块
│   ├── common/                          # 公共模块
│   │   ├── decorators/                  # 自定义装饰器
│   │   │   ├── roles.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── filters/                     # 异常过滤器
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/                      # 守卫
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/                # 拦截器
│   │   │   └── transform.interceptor.ts
│   │   ├── pipes/                       # 管道
│   │   │   └── validation.pipe.ts
│   │   └── utils/                       # 工具类
│   │       ├── oss.util.ts
│   │       ├── wechat.util.ts
│   │       └── order-no.util.ts
│   ├── modules/
│   │   ├── auth/                        # 认证模块
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── strategies/
│   │   │       └── jwt.strategy.ts
│   │   ├── user/                        # 用户模块
│   │   ├── company/                     # 公司模块
│   │   │   ├── company.module.ts
│   │   │   ├── company.controller.ts
│   │   │   ├── company.service.ts
│   │   │   └── company-admins/          # 公司管理员子模块
│   │   ├── team/                        # 团队模块
│   │   ├── demand/                      # 需求模块
│   │   ├── quote/                       # 报价模块
│   │   ├── order/                       # 订单模块
│   │   ├── construction-log/            # 施工日志模块
│   │   ├── message/                     # 留言模块
│   │   ├── review/                      # 评价模块
│   │   ├── case/                        # 案例模块
│   │   ├── compliance/                  # 合规模板模块
│   │   ├── file/                        # 文件模块
│   │   ├── notification/                # 消息通知模块
│   │   ├── event-log/                   # 事件日志模块
│   │   └── admin/                       # 后台管理模块
│   │       ├── admin-auth/
│   │       ├── admin-user/
│   │       ├── admin-company/
│   │       ├── admin-team/
│   │       ├── admin-demand/
│   │       ├── admin-quote/
│   │       ├── admin-order/
│   │       ├── admin-case/
│   │       ├── admin-compliance/
│   │       └── admin-dashboard/
│   ├── prisma/
│   │   ├── schema.prisma                # Prisma Schema
│   │   └── migrations/                  # 数据库迁移
│   └── config/
│       ├── database.config.ts
│       ├── redis.config.ts
│       ├── oss.config.ts
│       └── wechat.config.ts
├── test/
├── Dockerfile
├── docker-compose.yml
├── nest-cli.json
├── tsconfig.json
├── package.json
└── .env.example
```

### 9.2 小程序项目结构 (uni-app)

```
miniapp/
├── src/
│   ├── App.vue
│   ├── main.ts
│   ├── pages.json                       # 页面路由配置
│   ├── manifest.json                    # 应用配置
│   ├── pages/
│   │   ├── login/                       # 登录
│   │   ├── role-select/                 # 角色选择
│   │   ├── demander/                    # 需求方页面
│   │   │   ├── home/
│   │   │   ├── publish/
│   │   │   ├── my-demands/
│   │   │   ├── demand-detail/
│   │   │   ├── order-detail/
│   │   │   ├── log-timeline/
│   │   │   ├── review/
│   │   │   └── profile/
│   │   ├── provider/                    # 服务方页面
│   │   │   ├── hall/
│   │   │   ├── demand-detail/
│   │   │   ├── submit-quote/
│   │   │   ├── my-quotes/
│   │   │   ├── my-orders/
│   │   │   ├── order-detail/
│   │   │   ├── upload-log/
│   │   │   ├── team-manage/
│   │   │   ├── upload-case/
│   │   │   └── profile/
│   │   ├── team/                        # 团队公开页
│   │   ├── case/                        # 案例页
│   │   ├── compliance/                  # 合规知识页
│   │   └── common/                      # 公共页面
│   │       ├── message-board/
│   │       ├── file-preview/
│   │       └── notifications/
│   ├── components/                      # 公共组件
│   │   ├── image-upload/
│   │   ├── video-upload/
│   │   ├── rating-stars/
│   │   ├── status-tag/
│   │   ├── empty-state/
│   │   └── load-more/
│   ├── api/                             # API接口封装
│   │   ├── request.ts                   # 请求封装(axios/uni.request)
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── company.ts
│   │   ├── team.ts
│   │   ├── demand.ts
│   │   ├── quote.ts
│   │   ├── order.ts
│   │   ├── log.ts
│   │   ├── message.ts
│   │   ├── review.ts
│   │   ├── compliance.ts
│   │   └── file.ts
│   ├── stores/                          # 状态管理(Pinia)
│   │   ├── user.ts
│   │   ├── demand.ts
│   │   └── app.ts
│   ├── utils/                           # 工具类
│   │   ├── auth.ts
│   │   ├── location.ts
│   │   ├── format.ts
│   │   └── validate.ts
│   └── static/                          # 静态资源
│       ├── images/
│       └── icons/
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 9.3 Web后台项目结构 (Vue3)

```
admin/
├── src/
│   ├── App.vue
│   ├── main.ts
│   ├── router/                          # 路由配置
│   │   └── index.ts
│   ├── layouts/                         # 布局
│   │   └── AdminLayout.vue
│   ├── views/                           # 页面
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── teams/
│   │   ├── demands/
│   │   ├── quotes/
│   │   ├── orders/
│   │   ├── cases/
│   │   ├── compliance/
│   │   ├── reviews/
│   │   └── settings/
│   ├── components/                      # 公共组件
│   ├── api/                             # API封装
│   ├── stores/                          # Pinia状态管理
│   ├── utils/
│   └── styles/
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 十、关键业务流程时序图

### 10.1 需求发布与抢单报价流程

```
需求方(小程序)     后端服务        服务方(小程序)      运营(Web后台)
    │                │                │                  │
    │ 1.填写需求表单   │                │                  │
    │───────────────→│                │                  │
    │                │ 2.保存需求      │                  │
    │                │ (状态:待抢单)    │                  │
    │                │                │                  │
    │                │ 3.推送新需求通知 │                  │
    │                │───────────────→│                  │
    │                │                │                  │
    │                │ 4.浏览需求列表   │                  │
    │                │←───────────────│                  │
    │                │                │                  │
    │                │ 5.查看需求详情   │                  │
    │                │←───────────────│                  │
    │                │                │                  │
    │                │ 6.提交报价      │                  │
    │                │←───────────────│                  │
    │                │ (状态:待审核)    │                  │
    │                │                │                  │
    │                │ 7.推送待审核通知 │                  │
    │                │──────────────────────────────────→│
    │                │                │                  │
    │                │                │    8.审核报价     │
    │                │                │   (通过/拒绝)     │
    │                │←──────────────────────────────────│
    │                │                │                  │
    │                │ 9.推送审核结果   │                  │
    │                │───────────────→│                  │
    │                │                │                  │
    │ 10.推送新报价   │                │                  │
    │←───────────────│                │                  │
    │                │                │                  │
    │ 11.查看报价列表  │                │                  │
    │───────────────→│                │                  │
    │                │                │                  │
    │ 12.选择报价     │                │                  │
    │───────────────→│                │                  │
    │                │ 13.更新需求状态  │                  │
    │                │ (需求→已选团队)  │                  │
    │                │                │                  │
    │                │ 14.推送报价被选通知                  │
    │                │───────────────→│                  │
    │                │                │                  │
    │                │ 15.服务方创建订单 │                  │
    │                │←───────────────│                  │
    │                │ (状态:待确认)    │                  │
    │                │                │                  │
    │                │ 16.推送新订单通知 │                  │
    │                │───────────────→│                  │
    │                │                │                  │
    │ 17.确认合作     │                │                  │
    │───────────────→│                │                  │
    │                │ 18.订单→施工中   │                  │
    │                │                │                  │
    │                │ 19.推送确认通知   │                  │
    │                │───────────────→│                  │
```

### 10.2 施工日志上传与查看流程

```
服务方(小程序)     后端服务        需求方(小程序)
    │                │                │
    │ 1.填写日志内容   │                │
    │ (文字+图片+视频) │                │
    │───────────────→│                │
    │                │ 2.上传文件到OSS  │
    │                │ 3.保存日志记录   │
    │                │ 4.记录事件日志   │
    │                │                │
    │                │ 5.推送日志更新通知│
    │                │───────────────→│
    │                │                │
    │                │ 6.查看日志时间线 │
    │                │←───────────────│
    │                │                │
    │                │ 7.返回日志列表   │
    │                │───────────────→│
    │                │                │
    │                │ 8.查看日志详情   │
    │                │←───────────────│
    │                │ (文字+图片+视频) │
    │                │───────────────→│
```

---

## 十一、Redis 缓存设计

| Key | 类型 | 用途 | TTL |
|-----|------|------|-----|
| `token:{userId}` | String | JWT Token黑名单 | Token剩余有效期 |
| `user:session:{userId}` | Hash | 用户会话信息 | 7天 |
| `sms:code:{phone}` | String | 短信验证码 | 5分钟 |
| `demand:hall:cache` | String | 抢单大厅列表缓存 | 1分钟 |
| `team:profile:{teamId}` | Hash | 团队信息缓存 | 30分钟 |
| `api:rate:{ip}:{path}` | String | 接口限流计数 | 1分钟 |
| `subscribe:template:{userId}` | Set | 用户订阅的模板消息 | 永久 |
| `dashboard:stats` | Hash | 后台看板统计数据缓存 | 5分钟 |

---

## 十二、后续扩展预留

| 扩展方向 | 预留设计 |
|---------|---------|
| 在线支付 | 订单表预留 `payment_status`、`transaction_id` 字段 |
| 电子合同 | 订单表预留 `contract_url` 字段 |
| 数据分析看板 | 事件日志表已覆盖核心业务事件，可直接聚合分析 |
| 资讯信息 | 合规模板表 `category` 字段可扩展资讯分类 |
| 多城市扩展 | 需求表 `district` 字段可扩展为城市+区域两级 |
| IM实时聊天 | 留言表结构可平滑升级为IM消息表，增加 `msg_type`、`is_deleted` 等字段 |
| 多团队协作承接 | 订单表 `quote_ids` 已为JSON数组，后续可扩展为多团队子任务拆分 |

---

## 附录

### A. 业务编号生成规则

| 编号类型 | 格式 | 示例 |
|---------|------|------|
| 需求编号 | DM + yyyyMMdd + 6位序号 | DM20260427000001 |
| 报价编号 | QT + yyyyMMdd + 6位序号 | QT20260427000001 |
| 订单编号 | OD + yyyyMMdd + 6位序号 | OD20260427000001 |

### B. 拆除类型枚举

| 值 | 类型 |
|----|------|
| 1 | 室内拆除 |
| 2 | 店面拆除 |
| 3 | 围墙拆除 |
| 4 | 小型构筑物拆除 |
| 5 | 管道拆除 |
| 6 | 其他 |

### C. 上海行政区编码

| 编码 | 区名 | 编码 | 区名 |
|------|------|------|------|
| 310101 | 黄浦区 | 310110 | 杨浦区 |
| 310104 | 徐汇区 | 310112 | 闵行区 |
| 310105 | 长宁区 | 310113 | 宝山区 |
| 310106 | 静安区 | 310114 | 嘉定区 |
| 310107 | 普陀区 | 310115 | 浦东新区 |
| 310109 | 虹口区 | 310116 | 金山区 |
| 310118 | 松江区 | 310120 | 奉贤区 |
| 310151 | 崇明区 | 310117 | 青浦区 |
