import { post } from '@/utils/request'

// 管理员登录
export function adminLogin(data) {
  return post('/auth/admin/login', data)
}
