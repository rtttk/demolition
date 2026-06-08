/**
 * 需求相关 API
 */
import { get, post, put } from '@/utils/request'

/**
 * 发布需求
 * @param {Object} data - 需求表单数据
 */
export function createDemand(data) {
  return post('/demands', data)
}

/**
 * 获取我的需求列表
 * @param {Object} params - { page, pageSize, status }
 */
export function getMyDemands(params) {
  return get('/demands/my', params)
}

/**
 * 获取需求详情
 * @param {number|string} id
 */
export function getDemandDetail(id) {
  return get(`/demands/${id}`)
}

/**
 * 获取需求大厅列表（服务方）
 * @param {Object} params - { page, pageSize, demoType, district }
 */
export function getDemandHall(params) {
  return get('/demands/hall', params)
}

/**
 * 选择报价
 * @param {number|string} id - 需求ID
 * @param {Object} data - { quoteIds: number[] }
 */
export function selectQuote(id, data) {
  return put(`/demands/${id}/select-quotes`, data)
}

/**
 * 取消需求
 * @param {number|string} id
 */
export function cancelDemand(id) {
  return put(`/demands/${id}/cancel`)
}
