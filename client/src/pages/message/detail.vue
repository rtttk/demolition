<template>
  <view class="message-detail-page">
    <!-- 消息头部 -->
    <view class="msg-header">
      <text class="msg-title">{{ message.title || '消息详情' }}</text>
      <text class="msg-time">{{ message.createTime || '' }}</text>
    </view>

    <!-- 消息内容 -->
    <view class="msg-body">
      <rich-text class="msg-content" :nodes="message.content || '暂无内容'" />
    </view>

    <!-- 关联操作 -->
    <view v-if="message.relatedOrder" class="related-section">
      <text class="section-title">关联订单</text>
      <view class="order-card" @click="goOrder">
        <text class="order-no">{{ message.relatedOrder.orderNo || '' }}</text>
        <text class="order-title">{{ message.relatedOrder.title || '查看订单' }}</text>
        <text class="order-arrow">></text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getMessages, markMessageRead } from '@/api/message'
import { showLoading, hideLoading } from '@/utils/util'

const messageId = ref(null)
const message = ref({})

async function loadDetail() {
  if (!messageId.value) return

  showLoading()
  try {
    // 标记已读
    await markMessageRead(messageId.value)

    // 获取消息详情（从列表中获取或单独请求）
    const res = await getMessages({ page: 1, size: 100 })
    const data = res.data || res
    const list = data.list || data.records || []
    const found = list.find(m => String(m.id) === String(messageId.value))
    if (found) {
      message.value = found
    }
  } catch (error) {
    console.error('获取消息详情失败:', error)
  } finally {
    hideLoading()
  }
}

function goOrder() {
  if (message.value.relatedOrder?.id) {
    uni.navigateTo({ url: `/pages/order/detail?id=${message.value.relatedOrder.id}` })
  }
}

onLoad((options) => {
  messageId.value = options.id
  loadDetail()
})
</script>

<style lang="scss" scoped>
.message-detail-page {
  min-height: 100vh;
  background-color: $bg-page;
}

.msg-header {
  background-color: $bg-card;
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
}

.msg-title {
  font-size: $font-size-xl;
  font-weight: bold;
  color: $text-title;
  display: block;
  margin-bottom: 12rpx;
}

.msg-time {
  font-size: $font-size-sm;
  color: $text-placeholder;
}

.msg-body {
  background-color: $bg-card;
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
}

.msg-content {
  font-size: $font-size-base;
  color: $text-main;
  line-height: 1.8;
}

.related-section {
  background-color: $bg-card;
  padding: 28rpx 32rpx;
}

.section-title {
  font-size: $font-size-md;
  font-weight: bold;
  color: $text-title;
  margin-bottom: 20rpx;
}

.order-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background-color: $bg-gray;
  border-radius: $radius-md;
}

.order-no {
  font-size: $font-size-xs;
  color: $text-placeholder;
}

.order-title {
  flex: 1;
  font-size: $font-size-base;
  color: $primary-color;
}

.order-arrow {
  font-size: $font-size-sm;
  color: $text-placeholder;
}
</style>
