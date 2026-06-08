<template>
  <view class="message-page">
    <!-- 消息列表 -->
    <scroll-view
      class="message-list"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <template v-if="messageList.length > 0">
        <view
          v-for="(msg, index) in messageList"
          :key="msg.id || index"
          class="message-item"
          :class="{ unread: !msg.isRead }"
          @click="goDetail(msg)"
        >
          <!-- 消息图标 -->
          <view class="msg-icon" :class="`msg-icon--${msg.type || 'system'}`">
            <text class="icon-text">{{ getIconText(msg.type) }}</text>
          </view>

          <!-- 消息内容 -->
          <view class="msg-content">
            <view class="msg-header">
              <text class="msg-title">{{ msg.title || '系统消息' }}</text>
              <text class="msg-time">{{ msg.createTime || '' }}</text>
            </view>
            <text class="msg-desc ellipsis">{{ msg.content || msg.summary || '' }}</text>
          </view>

          <!-- 未读标记 -->
          <view v-if="!msg.isRead" class="unread-dot" />
        </view>

        <loading-more :status="loadStatus" @loadmore="loadMore" />
      </template>

      <empty-state
        v-else-if="!loading"
        icon="empty"
        title="暂无消息"
      />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import EmptyState from '@/components/empty-state/empty-state.vue'
import LoadingMore from '@/components/loading-more/loading-more.vue'
import { getMessages } from '@/api/message'
import { PAGE_DEFAULTS } from '@/utils/constants'
import { useAppStore } from '@/store/modules/app'

const appStore = useAppStore()

const messageList = ref([])
const loading = ref(false)
const refreshing = ref(false)
const page = ref(PAGE_DEFAULTS.PAGE)
const hasMore = ref(true)
const loadStatus = ref('no-more')

/**
 * 获取消息图标文字
 */
function getIconText(type) {
  const map = {
    system: '系',
    order: '单',
    quote: '报',
    review: '评'
  }
  return map[type] || '消'
}

/**
 * 加载消息列表
 */
async function fetchMessages(isRefresh = false) {
  if (loading.value) return

  if (isRefresh) {
    page.value = PAGE_DEFAULTS.PAGE
    hasMore.value = true
  }

  if (!hasMore.value) return

  loading.value = true
  loadStatus.value = 'loading'

  try {
    const res = await getMessages({
      page: page.value,
      size: PAGE_DEFAULTS.SIZE
    })
    const data = res.data || res
    const list = data.list || data.records || []

    if (isRefresh) {
      messageList.value = list
    } else {
      messageList.value.push(...list)
    }

    hasMore.value = list.length >= PAGE_DEFAULTS.SIZE
    loadStatus.value = hasMore.value ? 'loadmore' : 'no-more'
  } catch (error) {
    console.error('获取消息列表失败:', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function onRefresh() {
  refreshing.value = true
  fetchMessages(true)
}

function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value++
  fetchMessages()
}

function goDetail(msg) {
  uni.navigateTo({ url: `/pages/message/detail?id=${msg.id}` })
}

onShow(() => {
  fetchMessages(true)
  appStore.fetchUnreadCount()
})

onMounted(() => {
  fetchMessages(true)
})
</script>

<style lang="scss" scoped>
.message-page {
  min-height: 100vh;
  background-color: $bg-page;
}

.message-list {
  height: calc(100vh - 44px);
  padding: 20rpx 0;
}

.message-item {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  background-color: $bg-card;
  margin-bottom: 2rpx;
  position: relative;

  &.unread {
    background-color: #FFF9F5;
  }
}

.msg-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;

  &--system {
    background-color: #E3F2FD;
  }
  &--order {
    background-color: $primary-light;
  }
  &--quote {
    background-color: #E8F5E9;
  }
  &--review {
    background-color: #FFF3E0;
  }

  .icon-text {
    font-size: $font-size-base;
    font-weight: bold;
    color: $text-secondary;
  }
}

.msg-content {
  flex: 1;
  min-width: 0;
}

.msg-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.msg-title {
  font-size: $font-size-base;
  font-weight: bold;
  color: $text-title;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 16rpx;
}

.msg-time {
  font-size: $font-size-xs;
  color: $text-placeholder;
  white-space: nowrap;
}

.msg-desc {
  font-size: $font-size-sm;
  color: $text-secondary;
  line-height: 1.4;
}

.unread-dot {
  position: absolute;
  top: 28rpx;
  right: 32rpx;
  width: 16rpx;
  height: 16rpx;
  background-color: $error-color;
  border-radius: 50%;
}
</style>
