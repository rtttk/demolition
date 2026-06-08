/**
 * 团队相关 API
 */
import { get, post, put } from '@/utils/request'

/**
 * 获取团队详情
 * @param {number|string} id
 */
export function getTeamDetail(id) {
  return get(`/teams/${id}`)
}

/**
 * 获取我的团队
 */
export function getMyTeam() {
  return get('/teams/list')
}

/**
 * 获取推荐团队
 * @param {Object} params - { page, pageSize }
 */
export function getRecommendTeams(params) {
  return get('/teams/recommend', params)
}

/**
 * 创建团队
 * @param {Object} data - { companyId, name, leaderAName, leaderAPhone, leaderBName, leaderBPhone, teamSize, specialties, description, serviceArea }
 */
export function createTeam(data) {
  return post('/teams', data)
}

/**
 * 更新团队信息
 * @param {number|string} id
 * @param {Object} data - { name, leaderAName, leaderAPhone, leaderBName, leaderBPhone, teamSize, specialties, description, serviceArea }
 */
export function updateTeam(id, data) {
  return put(`/teams/${id}`, data)
}
