import { get, put } from '@/utils/request'

// 获取企业列表
export function getCompanyList(params) {
  return get('/admin/companies', params)
}

// 审核企业
export function verifyCompany(id, data) {
  return put(`/admin/companies/${id}/verify`, data)
}

// 获取企业下的团队
export function getCompanyTeams(id, params) {
  return get(`/admin/companies/${id}/teams`, params)
}
