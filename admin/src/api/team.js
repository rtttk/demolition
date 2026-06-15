import { get, put, del } from '@/utils/request'

// 获取团队列表
export function getTeamList(params) {
  return get('/admin/teams', params)
}

// 更新团队状态
export function updateTeamStatus(id, data) {
  return put(`/admin/teams/${id}/status`, data)
}

// 获取所有团队简表
export function getAllTeams() {
  return get('/admin/teams/all')
}

// 获取团队成员列表
export function getTeamMembers(id) {
  return get(`/admin/teams/${id}/members`)
}

// 设置/取消团队队长
export function setTeamLeader(teamId, userId, isLeader) {
  return put(`/admin/teams/${teamId}/members/${userId}/leader`, { isLeader })
}

// 移除团队成员
export function removeTeamMember(teamId, userId) {
  return del(`/admin/teams/${teamId}/members/${userId}`)
}

// 设置/取消团队推荐
export function setTeamRecommended(teamId, recommended) {
  return put(`/admin/teams/${teamId}/recommended`, { recommended })
}
