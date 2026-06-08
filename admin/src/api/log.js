import { get } from '@/utils/request'

// 获取施工日志列表
export function getLogList(params) {
  return get('/admin/logs', params)
}
