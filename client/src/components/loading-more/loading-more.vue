<template>
  <view class="loading-more">
    <!-- 加载中 -->
    <view v-if="status === 'loading'" class="loading-content">
      <view class="loading-spinner" />
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 点击加载更多 -->
    <view v-else-if="status === 'loadmore'" class="loadmore-content" @click="$emit('loadmore')">
      <text class="loadmore-text">点击加载更多</text>
    </view>

    <!-- 没有更多 -->
    <view v-else class="no-more-content">
      <view class="no-more-line" />
      <text class="no-more-text">没有更多了</text>
      <view class="no-more-line" />
    </view>
  </view>
</template>

<script setup>
defineProps({
  // 状态: no-more, loading, loadmore
  status: {
    type: String,
    default: 'no-more'
  }
})

defineEmits(['loadmore'])
</script>

<style lang="scss" scoped>
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 0 40rpx;
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.loading-spinner {
  width: 32rpx;
  height: 32rpx;
  border: 4rpx solid $border-color;
  border-top-color: $primary-color;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: $font-size-sm;
  color: $text-placeholder;
}

.loadmore-content {
  padding: 16rpx 48rpx;
  background-color: $bg-card;
  border-radius: $radius-round;
  border: 1rpx solid $border-color;

  .loadmore-text {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.no-more-content {
  display: flex;
  align-items: center;
  gap: 20rpx;
  width: 100%;
  padding: 0 60rpx;
}

.no-more-line {
  flex: 1;
  height: 1rpx;
  background-color: $border-color;
}

.no-more-text {
  font-size: $font-size-sm;
  color: $text-placeholder;
  white-space: nowrap;
}
</style>
