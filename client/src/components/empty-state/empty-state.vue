<template>
  <view class="empty-state">
    <!-- 空状态图标 -->
    <image
      v-if="icon === 'empty'"
      class="empty-icon"
      src="/static/empty.png"
      mode="aspectFit"
    />
    <view v-else-if="icon === 'order'" class="empty-icon-wrapper">
      <text class="iconfont icon-order">&#xe60a;</text>
    </view>
    <view v-else-if="icon === 'search'" class="empty-icon-wrapper">
      <text class="iconfont icon-search">&#xe60b;</text>
    </view>
    <view v-else-if="icon === 'network'" class="empty-icon-wrapper">
      <text class="iconfont icon-network">&#xe60c;</text>
    </view>
    <view v-else class="empty-icon-wrapper">
      <text class="iconfont icon-empty">&#xe60d;</text>
    </view>

    <!-- 标题 -->
    <text class="empty-title">{{ title || '暂无数据' }}</text>

    <!-- 操作按钮 -->
    <view v-if="actionText" class="empty-action" @click="$emit('action')">
      <text class="action-text">{{ actionText }}</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  // 图标类型: empty, order, search, network
  icon: {
    type: String,
    default: 'empty'
  },
  // 标题文字
  title: {
    type: String,
    default: ''
  },
  // 操作按钮文字
  actionText: {
    type: String,
    default: ''
  }
})

defineEmits(['action'])
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 60rpx;
}

.empty-icon {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 32rpx;
}

.empty-icon-wrapper {
  width: 240rpx;
  height: 240rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
  background-color: $bg-gray;
  border-radius: 50%;

  .iconfont {
    font-size: 100rpx;
    color: $text-placeholder;
  }
}

.empty-title {
  font-size: $font-size-base;
  color: $text-placeholder;
  margin-bottom: 40rpx;
}

.empty-action {
  padding: 16rpx 48rpx;
  background-color: $primary-color;
  border-radius: $radius-round;

  .action-text {
    font-size: $font-size-base;
    color: #FFFFFF;
  }
}
</style>
