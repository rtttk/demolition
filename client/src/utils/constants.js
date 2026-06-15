/**
 * 应用常量定义
 */

// API 基础地址
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

// 拆除类型
export const DEMO_TYPES = {
  1: '室内拆除',
  2: '店面拆除',
  3: '围墙拆除',
  4: '小型构筑物',
  5: '管道拆除',
  6: '其他'
}

// 拆除类型数组（用于选择器）
export const DEMO_TYPE_OPTIONS = Object.entries(DEMO_TYPES).map(([value, label]) => ({
  value: Number(value),
  label
}))

// 需求状态
export const DEMAND_STATUS = {
  0: '待报价',
  1: '报价中',
  2: '已选标',
  3: '已签约',
  4: '施工中',
  5: '待验收',
  6: '已完成',
  7: '已取消',
  8: '已过期'
}

// 需求状态颜色
export const DEMAND_STATUS_COLOR = {
  0: '#FAAD14',
  1: '#1989FA',
  2: '#FF6B35',
  3: '#07C160',
  4: '#07C160',
  5: '#FAAD14',
  6: '#999999',
  7: '#CCCCCC',
  8: '#CCCCCC'
}

// 订单状态
export const ORDER_STATUS = {
  0: '待审核',
  1: '待签约',
  2: '待开工',
  3: '施工中',
  4: '待验收',
  5: '已完成',
  6: '已取消'
}

// 订单状态颜色
export const ORDER_STATUS_COLOR = {
  0: '#FAAD14',
  1: '#1989FA',
  2: '#07C160',
  3: '#07C160',
  4: '#FAAD14',
  5: '#999999',
  6: '#CCCCCC'
}

// 报价状态
export const QUOTE_STATUS = {
  0: '待审核',
  1: '已通过',
  2: '未通过',
  3: '已中标',
  4: '未中标'
}

// 报价状态颜色
export const QUOTE_STATUS_COLOR = {
  0: '#FAAD14',
  1: '#07C160',
  2: '#FA5151',
  3: '#FF6B35',
  4: '#999999'
}

// 合规知识分类
export const COMPLIANCE_CATEGORIES = ['政策法规', '安全规范', '合同模板']

// 用户角色
export const USER_ROLES = {
  1: '需求方',
  2: '服务方'
}

// 用户角色列表（用于选择器）
export const ROLE_LIST = [
  { value: 1, label: '需求方', icon: '🏠', desc: '我有拆除需求，需要寻找专业团队' },
  { value: 2, label: '服务方', icon: '🔧', desc: '我是专业拆除团队，提供拆除服务' }
]

// 预算范围选项
export const BUDGET_OPTIONS = [
  { value: '0-5000', label: '5000元以下' },
  { value: '5000-10000', label: '5000-10000元' },
  { value: '10000-50000', label: '1万-5万元' },
  { value: '50000-100000', label: '5万-10万元' },
  { value: '100000-500000', label: '10万-50万元' },
  { value: '500000+', label: '50万元以上' }
]

// 评价标签
export const REVIEW_TAGS = [
  '施工专业', '按时完工', '价格合理', '沟通顺畅',
  '现场整洁', '服务态度好', '经验丰富', '推荐他人'
]

// 图片上传限制
export const UPLOAD_LIMITS = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_COUNT: 9,
  MAX_REVIEW_IMAGE_COUNT: 6,
  ALLOWED_TYPES: ['jpg', 'jpeg', 'png', 'gif', 'webp']
}

// 分页默认值
export const PAGE_DEFAULTS = {
  PAGE: 1,
  SIZE: 10
}

// 存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  SESSION_TOKEN: 'sessionToken',
  USER_INFO: 'userInfo',
  CURRENT_ROLE: 'currentRole',
  NEED_PHONE: 'needPhone',  // 标记当前用户是否需要绑定手机号（phone 为空）
}
