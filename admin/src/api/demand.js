import { get, put } from '@/utils/request'

// 获取需求列表
export function getDemandList(params) {
  return get('/admin/demands', params)
}

// 更新需求状态
export function updateDemandStatus(id, data) {
  return put(`/admin/demands/${id}/status`, data)
}
