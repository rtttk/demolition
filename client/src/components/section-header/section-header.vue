<template>
  <view class="section-header">
    <view class="header-left">
      <view class="title-bar" />
      <text class="title">{{ title }}</text>
    </view>
    <view v-if="showMore" class="header-right" @click="$emit('more')">
      <text class="more-text">查看全部</text>
      <image class="more-arrow" src="/static/icons/arrow-right.svg" mode="aspectFit" />
    </view>
  </view>
</template>

<script setup>
defineProps({
  // 标题
  title: {
    type: String,
    default: ''
  },
  // 是否显示"查看全部"
  showMore: {
    type: Boolean,
    default: false
  }
})

defineEmits(['more'])
</script>

<style lang="scss" scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-6 $spacing-8;
}

.header-left {
  display: flex;
  align-items: center;
  gap: $spacing-3;
}

.title-bar {
  width: 6rpx;
  height: 32rpx;
  background-color: $primary-color;
  border-radius: 3rpx;
}

.title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-title;
}

.header-right {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  padding: $spacing-2 0;
  cursor: pointer;
  transition: opacity $transition-fast;

  &:active {
    opacity: 0.7;
  }

  .more-text {
    font-size: $font-size-sm;
    color: $text-placeholder;
  }

  .more-arrow {
    width: 24rpx;
    height: 24rpx;
    color: $text-placeholder;
  }
}
</style>
