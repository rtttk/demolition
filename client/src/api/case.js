/**
 * 案例相关 API
 */
import { get, post } from '@/utils/request'

/**
 * 上传案例
 * @param {Object} data - { title, demoType, address?, area?, duration?, description?, beforeImageIds?, afterImageIds? }
 */
export function createCase(data) {
  return post('/cases', data)
}

/**
 * 获取案例列表
 * @param {Object} params - { page, pageSize, demoType }
 */
export function getCases(params) {
  return get('/cases', params)
}

/**
 * 获取案例详情
 * @param {number|string} id
 */
export function getCaseDetail(id) {
  return get(`/cases/${id}`)
}

/**
 * 获取推荐案例
 * @param {Object} params - { page, pageSize }
 */
export function getRecommendCases(params) {
  return get('/cases/recommend', params)
}
