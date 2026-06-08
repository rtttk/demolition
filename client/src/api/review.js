/**
 * 评价相关 API
 */
import { get, post } from '@/utils/request'

/**
 * 提交评价
 * @param {Object} data - { orderId, teamId, rating, content, imageIds }
 */
export function submitReview(data) {
  return post('/reviews', data)
}

/**
 * 获取评价列表
 * @param {Object} params - { teamId, page, pageSize }
 */
export function getReviews(params) {
  return get('/reviews', params)
}
