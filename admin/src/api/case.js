import { get, put } from '@/utils/request'

// 获取案例列表
export function getCaseList(params) {
  return get('/admin/cases', params)
}

// 更新案例状态
export function updateCaseStatus(id, data) {
  return put(`/admin/cases/${id}/status`, data)
}
