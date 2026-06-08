/**
 * 消息相关 API
 */
import { get, put } from '@/utils/request'

/**
 * 获取消息列表
 * @param {Object} params - { page, pageSize, senderRole }
 */
export function getMessages(params) {
  return get('/messages', params)
}

/**
 * 获取未读消息数
 */
export function getUnreadCount() {
  return get('/messages/unread-count')
}

/**
 * 标记消息已读
 * @param {number|string} id
 */
export function markMessageRead(id) {
  return put(`/messages/${id}/read`)
}

/**
 * 全部标记已读
 */
export function markAllRead() {
  return put('/messages/read-all')
}
