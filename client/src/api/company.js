/**
 * 企业相关 API
 */
import { get, post, put } from '@/utils/request'

/**
 * 获取我的企业信息
 */
export function getMyCompany() {
  return get('/companies/my')
}

/**
 * 更新企业信息
 * @param {Object} data
 */
export function updateCompany(data) {
  return put('/companies/profile', data)
}

/**
 * 注册企业
 * @param {Object} data
 */
export function registerCompany(data) {
  return post('/companies/register', data)
}


