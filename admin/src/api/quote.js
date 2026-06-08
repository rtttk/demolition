import { get, put } from '@/utils/request'

// 获取报价列表
export function getQuoteList(params) {
  return get('/admin/quotes', params)
}

// 审核报价
export function reviewQuote(id, data) {
  return put(`/admin/quotes/${id}/review`, data)
}
