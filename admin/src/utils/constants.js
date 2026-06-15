// 拆除类型
export const DEMO_TYPES = {
  1: '室内拆除',
  2: '店面拆除',
  3: '围墙拆除',
  4: '小型构筑物',
  5: '管道拆除',
  6: '其他'
}

// 需求状态
export const DEMAND_STATUS = {
  0: '待报价',
  1: '报价中',
  2: '已推荐报价',
  3: '已选标',
  4: '施工中',
  5: '待验收',
  6: '已完成',
  7: '已取消'
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

// 报价状态
export const QUOTE_STATUS = {
  0: '待审核',
  1: '已通过',
  2: '已拒绝',
  3: '已中标',
  4: '未中标'
}

// 认证状态
export const VERIFY_STATUS = {
  0: '待审核',
  1: '已通过',
  2: '已拒绝'
}

// 用户角色
export const ROLE_MAP = {
  1: '需求方',
  2: '服务方',
  3: '平台运营'
}

// 账号状态
export const STATUS_MAP = {
  0: '禁用',
  1: '正常'
}

// 状态标签颜色
export const DEMAND_STATUS_TAG_TYPE = {
  0: 'info',
  1: 'warning',
  2: '',
  3: 'success',
  4: '',
  5: 'warning',
  6: 'success',
  7: 'danger'
}

export const QUOTE_STATUS_TAG_TYPE = {
  0: 'info',
  1: 'success',
  2: 'danger',
  3: 'success',
  4: 'info'
}

export const VERIFY_STATUS_TAG_TYPE = {
  0: 'warning',
  1: 'success',
  2: 'danger'
}

export const ORDER_STATUS_TAG_TYPE = {
  0: 'info',    // 待审核
  1: 'warning', // 待签约
  2: 'warning', // 待开工
  3: '',        // 施工中
  4: 'warning', // 待验收
  5: 'success', // 已完成
  6: 'danger'   // 已取消
}

// 合同状态
export const CONTRACT_STATUS = {
  0: '待上传',
  1: '待审核',
  2: '已通过'
}

export const CONTRACT_STATUS_TAG_TYPE = {
  0: 'info',    // 待上传
  1: 'warning', // 待审核
  2: 'success'  // 已通过
}

// 合规文档分类
export const COMPLIANCE_CATEGORIES = {
  qualification: '资质证书',
  safety: '安全规范',
  regulation: '市政规范',
  standard: '行业标准',
  other: '其他'
}
