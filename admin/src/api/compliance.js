import { get, post, put, del } from '@/utils/request'
import service from '@/utils/request'

// 获取合规文档列表
export function getComplianceList(params) {
  return get('/admin/compliance', params)
}

// 创建合规文档
export function createCompliance(data) {
  return post('/admin/compliance', data)
}

// 更新合规文档
export function updateCompliance(id, data) {
  return put(`/admin/compliance/${id}`, data)
}

// 删除合规文档
export function deleteCompliance(id) {
  return del(`/admin/compliance/${id}`)
}

// 上传文件（图片/文档）
export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return service.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
