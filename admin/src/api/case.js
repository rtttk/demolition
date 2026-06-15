import { get, post, put, del } from '@/utils/request'
import service from '@/utils/request'

// 获取案例列表
export function getCaseList(params) {
  return get('/admin/cases', params)
}

// 创建案例
export function createCase(data) {
  return post('/admin/cases', data)
}

// 更新案例
export function updateCase(id, data) {
  return put(`/admin/cases/${id}`, data)
}

// 更新案例状态
export function updateCaseStatus(id, data) {
  return put(`/admin/cases/${id}/status`, data)
}

// 上传文件（图片/文档）
export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return service.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
