import { get, put } from '@/utils/request'

// 获取用户列表
export function getUserList(params) {
  return get('/admin/users', params)
}

// 更新用户状态
export function updateUserStatus(id, data) {
  return put(`/admin/users/${id}/status`, data)
}

// 分配用户角色
export function assignUserRoles(id, roles) {
  return put(`/admin/users/${id}/roles`, { roles })
}

// 为用户关联/取消关联团队
export function assignUserTeam(id, teamId) {
  return put(`/admin/users/${id}/team`, { teamId })
}
