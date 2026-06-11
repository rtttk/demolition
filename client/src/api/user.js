/**
 * 用户相关 API
 */
import { get, put } from '@/utils/request'

/**
 * 获取用户资料
 */
export function getUserProfile() {
  return get('/users/profile')
}

/**
 * 更新用户资料
 * @param {Object} data - { nickname, realName, gender, age, idCardNo, idCardImages, qualificationLevel, workYears }
 */
export function updateUserProfile(data) {
  return put('/users/profile', data)
}

/**
 * 获取用户角色列表
 */
export function getUserRoles() {
  return get('/users/roles')
}

/**
 * 切换当前角色
 * @param {number} role - 目标角色：1=需求方 2=服务方
 */
export function switchUserRole(data) {
  return put('/users/role', data)
}

/**
 * 获取用户统计信息
 */
export function getUserStats() {
  return get('/users/stats')
}
