/**
 * 订单相关 API
 */
import { get, post, put } from '@/utils/request'

/**
 * 创建订单（签约）
 * @param {Object} data - { demandId, quoteId }
 */
export function createOrder(data) {
  return post('/orders', data)
}

/**
 * 获取我的订单列表
 * @param {Object} params - { page, pageSize, status }
 */
export function getMyOrders(params) {
  return get('/orders/my', params)
}

/**
 * 获取订单详情
 * @param {number|string} id
 */
export function getOrderDetail(id) {
  return get(`/orders/${id}`)
}

/**
 * 确认验收（需求方）
 * @param {number|string} id
 */
export function confirmOrder(id) {
  return put(`/orders/${id}/confirm`)
}

/**
 * 接受订单（服务方）
 * @param {number|string} id
 */
export function acceptOrder(id) {
  return put(`/orders/${id}/accept`)
}

/**
 * 取消订单
 * @param {number|string} id
 */
export function cancelOrder(id) {
  return put(`/orders/${id}/cancel`)
}
