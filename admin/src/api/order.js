import { get, put } from '@/utils/request'

// 获取订单列表
export function getOrderList(params) {
  return get('/admin/orders', params)
}

// 审核订单通过
export function approveOrder(orderId) {
  return put(`/admin/orders/${orderId}/approve`)
}

// 审核合同通过
export function approveContract(orderId) {
  return put(`/admin/orders/${orderId}/approve-contract`)
}
