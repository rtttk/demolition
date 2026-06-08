import { get, put } from '@/utils/request'

// 获取团队列表
export function getTeamList(params) {
  return get('/admin/teams', params)
}

// 更新团队状态
export function updateTeamStatus(id, data) {
  return put(`/admin/teams/${id}/status`, data)
}
