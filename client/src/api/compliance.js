/**
 * 合规知识相关 API
 */
import { get } from '@/utils/request'

/**
 * 获取合规知识列表
 * @param {Object} params - { page, pageSize, category }
 */
export function getComplianceDocs(params) {
  return get('/compliance-docs', params)
}

/**
 * 获取合规知识详情
 * @param {number|string} id
 */
export function getComplianceDetail(id) {
  return get(`/compliance-docs/${id}`)
}
