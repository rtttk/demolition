# 拆除服务平台 - 极简主义 UI 设计规范

> 版本: v2.0 | 更新日期: 2024年 | 设计风格: 极简主义 (Minimalism)

---

## 目录

1. [设计理念](#1-设计理念)
2. [色彩系统](#2-色彩系统)
3. [字体系统](#3-字体系统)
4. [图标规范](#4-图标规范)
5. [间距系统](#5-间距系统)
6. [圆角系统](#6-圆角系统)
7. [阴影系统](#7-阴影系统)
8. [组件规范](#8-组件规范)
9. [动画规范](#9-动画规范)

---

## 1. 设计理念

### 核心原则

| 原则 | 说明 | 实践 |
|------|------|------|
| **克制的色彩** | 只在必要时使用颜色 | 主色仅用于 CTA 和品牌标识 |
| **充足的留白** | 内容区域保持呼吸感 | 页面边距最小 32rpx |
| **清晰的层次** | 建立明确的视觉层级 | 使用字号、字重、间距区分 |
| **一致的交互** | 所有可点击元素有反馈 | 添加 hover/active 状态 |

### 设计目标

- ✅ 提升品牌专业感与信任度
- ✅ 降低用户认知负担
- ✅ 加快页面加载速度
- ✅ 提高触控区域可达性

---

## 2. 色彩系统

### 品牌色

```
Primary Orange:  #FF6B35    (主要 CTA、品牌标识)
Primary Light:   #FFF5F0    (背景、hover 状态)
Primary Dark:    #E55A25    (按下状态)
```

### 功能色

```
Success Green:   #10B981    (成功状态)
Warning Yellow:  #F59E0B    (警告状态)
Error Red:      #EF4444    (错误状态、删除操作)
Info Blue:      #3B82F6    (信息提示)
```

### 中性色 (极简灰阶)

```
Gray 50:  #FAFAFA    (页面背景)
Gray 100: #F5F5F5    (卡片背景)
Gray 200: #EEEEEE    (边框)
Gray 300: #E0E0E0    (禁用状态)
Gray 400: #BDBDBD    (占位符)
Gray 500: #9E9E9E    (次要文字)
Gray 600: #757575    (正文次要)
Gray 700: #616161    (正文)
Gray 800: #424242    (标题)
Gray 900: #212121    (主标题)
```

### 文字色

```
文字标题:  #212121    (Gray 900)
文字主色:  #424242    (Gray 800)
文字次要:  #757575    (Gray 600)
文字占位:  #BDBDBD    (Gray 400)
文字禁用:  #E0E0E0    (Gray 300)
```

---

## 3. 字体系统

### 字号层级

| 名称 | 大小 | 用途 | 字重 |
|------|------|------|------|
| xs | 20rpx | 标签、小字说明 | Regular |
| sm | 22rpx | 次要说明文字 | Regular |
| base | 26rpx | 正文内容 | Regular |
| md | 28rpx | 正文、菜单项 | Regular |
| lg | 30rpx | 小标题 | Medium |
| xl | 34rpx | 页面标题 | Semibold |
| xxl | 38rpx | 数字统计 | Bold |
| title | 44rpx | 主标题 | Bold |

### 行高规范

```
紧凑行高:  1.2   (标题)
正常行高:  1.5   (正文)
宽松行高:  1.75  (长文本)
```

### 字体栈

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial,
    sans-serif;
```

---

## 4. 图标规范

### 图标原则

> ⚠️ **严格禁止在 UI 中使用 Emoji 作为图标**

所有图标必须使用 SVG 格式，提供清晰的语义表达。

### TabBar 图标

位置: `/static/tabbar/`

| 图标 | 文件名 | 用途 |
|------|--------|------|
| 首页 | home.png / home-active.png | 首页入口 |
| 订单 | order.png / order-active.png | 订单管理 |
| 消息 | msg.png / msg-active.png | 消息通知 |
| 我的 | my.png / my-active.png | 个人中心 |

### 公共图标库

位置: `/static/icons/`

| 图标名 | 文件 | 用途 |
|--------|------|------|
| 发布 | publish.svg | 发布需求 |
| 订单 | order.svg | 订单相关 |
| 案例 | case.svg | 案例展示 |
| 合规 | compliance.svg | 合规知识 |
| 搜索 | search.svg | 搜索功能 |
| 箭头右 | arrow-right.svg | 列表导航 |
| 笔记 | note.svg | 需求记录 |
| 评价 | star.svg | 评分评价 |
| 消息 | message.svg | 消息通知 |
| 帮助 | help.svg | 常见问题 |
| 信息 | info.svg | 关于我们 |
| 反馈 | feedback.svg | 意见反馈 |
| 退出 | logout.svg | 退出登录 |
| 关闭 | close.svg | 关闭操作 |
| 勾选 | check.svg | 确认操作 |

### SVG 图标规范

```xml
<!-- 标准结构 -->
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 使用 24x24 viewBox -->
  <!-- stroke-width: 1.5 或 2 -->
  <!-- 使用 currentColor 实现颜色控制 -->
</svg>
```

### 图标颜色使用

```scss
// 普通状态 - 使用 gray-500
color: #9E9E9E;

// 激活状态 - 使用主色
color: $primary-color;  // #FF6B35

// 图标容器背景色
background-color: rgba($primary-color, 0.1);  // 10% 透明度
```

---

## 5. 间距系统

### 基于 8rpx 网格

所有间距必须是 8rpx 的倍数：

| 名称 | 大小 | 用途 |
|------|------|------|
| 1 | 4rpx | 微调、图标内间距 |
| 2 | 8rpx | 紧凑元素间距 |
| 3 | 12rpx | 小元素间距 |
| 4 | 16rpx | 常规间距 |
| 5 | 20rpx | 组件内间距 |
| 6 | 24rpx | 区块内间距 |
| 8 | 32rpx | 页面边距 |
| 10 | 40rpx | 大区块间距 |
| 12 | 48rpx | 页面顶部/底部 |

### 页面边距规范

```scss
// 页面内容区域
padding: 0 $spacing-8;  // 左右 32rpx

// 卡片内边距
padding: $spacing-6;   // 24rpx

// 列表项内边距
padding: $spacing-5 $spacing-6;  // 20rpx 24rpx
```

---

## 6. 圆角系统

### 圆角层级

| 名称 | 大小 | 用途 |
|------|------|------|
| sm | 6rpx | 小按钮、小标签 |
| md | 10rpx | 输入框、按钮 |
| lg | 14rpx | 卡片、面板 |
| xl | 20rpx | 大卡片、弹窗 |
| full | 9999rpx | 胶囊按钮、头像 |

### 圆角使用规范

```scss
// 按钮
border-radius: $radius-md;  // 10rpx

// 卡片
border-radius: $radius-lg;  // 14rpx

// 输入框
border-radius: $radius-full;  // 胶囊形

// 头像
border-radius: 50%;
```

---

## 7. 阴影系统

### 阴影层级

```scss
// 微阴影 - 用于卡片悬浮
$shadow-sm: 0 1rpx 2rpx rgba(0, 0, 0, 0.04);

// 中阴影 - 用于卡片和弹层
$shadow-md: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

// 大阴影 - 用于模态框
$shadow-lg: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
```

### 阴影使用原则

> 💡 极简风格中，阴影应克制使用。仅在需要区分层级时使用。

```scss
// ✅ 推荐：轻量阴影
box-shadow: $shadow-sm;

// ❌ 避免：过重阴影
box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
```

---

## 8. 组件规范

### 按钮

#### 主按钮

```scss
.btn-primary {
  height: 88rpx;
  background-color: $primary-color;
  color: #FFFFFF;
  border-radius: $radius-md;
  font-size: $font-size-md;
  font-weight: $font-weight-medium;
  
  &:active {
    background-color: $primary-dark;
  }
}
```

#### 次要按钮

```scss
.btn-secondary {
  height: 88rpx;
  background-color: transparent;
  color: $primary-color;
  border: 1rpx solid $primary-color;
  border-radius: $radius-md;
}
```

### 列表项

```scss
.list-item {
  display: flex;
  align-items: center;
  padding: $spacing-5 $spacing-6;
  background-color: $bg-card;
  border-bottom: 1rpx solid $border-color-light;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background-color: $bg-hover;
  }
}
```

### 卡片

```scss
.card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-6;
  box-shadow: $shadow-sm;
}
```

---

## 9. 动画规范

### 过渡时长

| 名称 | 时长 | 用途 |
|------|------|------|
| fast | 0.15s | 微交互、颜色变化 |
| normal | 0.2s | 常规状态切换 |
| slow | 0.3s | 页面过渡 |

### 过渡曲线

```scss
$transition-fast: 0.15s ease;
$transition-normal: 0.2s ease;
$transition-slow: 0.3s ease;
```

### 常见动画

```scss
// 颜色过渡
transition: color $transition-fast, background-color $transition-fast;

// 透明度变化 (点击反馈)
&:active {
  opacity: 0.7;
}

// 缩放变化 (避免使用，可能导致布局抖动)
// ❌ 不推荐: transform: scale(0.95)
```

---

## 更新日志

### v2.0 (2024)
- ✅ 全面极简主义风格重构
- ✅ 建立完整的 SVG 图标库
- ✅ 更新色彩系统为极简灰阶
- ✅ 规范间距、圆角、阴影系统
- ✅ 移除所有 Emoji 图标

### v1.0 (初始版本)
- 基础 UI 框架搭建
