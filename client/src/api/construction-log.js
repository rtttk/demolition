/**
 * 施工日志相关 API
 */
import { get, post, put } from '@/utils/request'

/**
 * 上传施工日志
 * @param {Object} data - { orderId, content, progress, imageIds, videoIds }
 */
export function createConstructionLog(data) {
  return post('/construction-logs', data)
}

/**
 * 获取施工日志列表
 * @param {Object} params - { orderId, page, pageSize }
 */
export function getConstructionLogs(params) {
  return get('/construction-logs', params)
}

/**
 * 检查今日是否已上传日志
 * @param {number|string} orderId
 */
export function checkTodayLog(orderId) {
  return get('/construction-logs/check', { orderId })
}

/**
 * 更新施工日志
 * @param {number|string} id
 * @param {Object} data
 */
export function updateConstructionLog(id, data) {
  return put(`/construction-logs/${id}`, data)
}
