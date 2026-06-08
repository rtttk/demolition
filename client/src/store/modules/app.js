import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUnreadCount } from '@/api/message'

export const useAppStore = defineStore('app', () => {
  // 未读消息数
  const unreadMessageCount = ref(0)

  /**
   * 获取未读消息数
   */
  async function fetchUnreadCount() {
    try {
      const res = await getUnreadCount()
      unreadMessageCount.value = res.data?.count || res.count || 0
    } catch (error) {
      console.error('获取未读消息数失败:', error)
    }
  }

  /**
   * 清除未读消息数
   */
  function clearUnreadCount() {
    unreadMessageCount.value = 0
  }

  /**
   * 减少未读消息数
   */
  function decreaseUnreadCount(count = 1) {
    unreadMessageCount.value = Math.max(0, unreadMessageCount.value - count)
  }

  return {
    unreadMessageCount,
    fetchUnreadCount,
    clearUnreadCount,
    decreaseUnreadCount
  }
})
