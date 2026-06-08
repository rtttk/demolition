<template>
  <view class="demand-card" @click="$emit('click')">
    <!-- 顶部：标题 + 状态 -->
    <view class="card-header">
      <text class="demand-title">{{ demand.title || '拆除需求' }}</text>
      <status-tag :status="demand.status" type="demand" />
    </view>

    <!-- 信息区域 -->
    <view class="card-body">
      <view class="info-row">
        <text class="info-label">拆除类型：</text>
        <text class="info-value">{{ demand.demoTypeName || '室内拆除' }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">拆除面积：</text>
        <text class="info-value">{{ demand.area ? demand.area + 'm²' : '待确认' }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">所在区域：</text>
        <text class="info-value ellipsis">{{ demand.district || demand.address || '待确认' }}</text>
      </view>
      <view v-if="demand.budget" class="info-row">
        <text class="info-label">预算范围：</text>
        <text class="info-value price">{{ demand.budget }}</text>
      </view>
    </view>

    <!-- 底部：时间 + 报价数 -->
    <view class="card-footer">
      <text class="create-time">{{ demand.createTime || '' }}</text>
      <view v-if="demand.quoteCount !== undefined" class="quote-count">
        <text class="count-text">{{ demand.quoteCount }}人报价</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import StatusTag from '@/components/status-tag/status-tag.vue'

defineProps({
  // 需求对象
  demand: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['click'])
</script>

<style lang="scss" scoped>
.demand-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
  box-shadow: $shadow-sm;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.demand-title {
  flex: 1;
  font-size: $font-size-md;
  font-weight: bold;
  color: $text-title;
  margin-right: 16rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-body {
  margin-bottom: 20rpx;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
  line-height: 1.6;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  font-size: $font-size-sm;
  color: $text-placeholder;
  white-space: nowrap;
}

.info-value {
  font-size: $font-size-sm;
  color: $text-main;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16rpx;
  border-top: 1rpx solid $border-color;
}

.create-time {
  font-size: $font-size-xs;
  color: $text-placeholder;
}

.quote-count {
  .count-text {
    font-size: $font-size-xs;
    color: $primary-color;
  }
}
</style>
