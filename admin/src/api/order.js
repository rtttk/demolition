import { get } from '@/utils/request'

// 获取订单列表
export function getOrderList(params) {
  return get('/admin/orders', params)
}
