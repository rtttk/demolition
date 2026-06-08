/**
 * 报价相关 API
 */
import { get, post } from '@/utils/request'

/**
 * 提交报价
 * @param {Object} data - { demandId, price, duration?, planSummary?, remark? }
 */
export function submitQuote(data) {
  return post('/quotes', data)
}

/**
 * 获取我的报价列表
 * @param {Object} params - { page, pageSize, status }
 */
export function getMyQuotes(params) {
  return get('/quotes/my', params)
}

/**
 * 检查是否已对某需求报价
 * @param {number|string} demandId
 */
export function checkQuote(demandId) {
  return get('/quotes/check', { demandId })
}
