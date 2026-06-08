<template>
  <view class="order-card" @click="$emit('click')">
    <!-- 顶部：订单号 + 状态 -->
    <view class="card-header">
      <text class="order-no">订单号：{{ order.orderNo || '--' }}</text>
      <status-tag :status="order.status" type="order" />
    </view>

    <!-- 中间：需求信息 -->
    <view class="card-body">
      <view class="demand-info">
        <text class="demand-title">{{ order.demandTitle || order.title || '拆除订单' }}</text>
        <text class="demand-type">{{ order.demoTypeName || '室内拆除' }}</text>
      </view>
      <view class="order-info">
        <view class="info-item">
          <text class="info-label">面积：</text>
          <text class="info-value">{{ order.area ? order.area + 'm²' : '--' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">金额：</text>
          <text class="info-value price">{{ order.amount || '--' }}</text>
        </view>
      </view>
    </view>

    <!-- 底部：时间 + 操作 -->
    <view class="card-footer">
      <text class="create-time">{{ order.createTime || '' }}</text>
      <view class="action-btn" @click.stop="onAction">
        <text class="action-text">{{ actionText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import StatusTag from '@/components/status-tag/status-tag.vue'

const props = defineProps({
  // 订单对象
  order: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['click', 'action'])

const actionText = computed(() => {
  const status = props.order.status
  const map = {
    0: '去确认',
    2: '查看日志',
    3: '去验收',
    4: '查看评价',
    5: '已取消'
  }
  return map[status] || '查看详情'
})

function onAction() {
  // 触发操作事件
}
</script>

<style lang="scss" scoped>
.order-card {
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

.order-no {
  font-size: $font-size-sm;
  color: $text-placeholder;
}

.card-body {
  margin-bottom: 20rpx;
}

.demand-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
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

.demand-type {
  font-size: $font-size-xs;
  color: $text-secondary;
  padding: 4rpx 16rpx;
  background-color: $bg-gray;
  border-radius: $radius-sm;
  white-space: nowrap;
}

.order-info {
  display: flex;
  gap: 40rpx;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  font-size: $font-size-sm;
  color: $text-placeholder;
}

.info-value {
  font-size: $font-size-sm;
  color: $text-main;

  &.price {
    color: $primary-color;
    font-weight: bold;
  }
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

.action-btn {
  padding: 8rpx 32rpx;
  background-color: $primary-color;
  border-radius: $radius-round;

  .action-text {
    font-size: $font-size-sm;
    color: #FFFFFF;
  }
}
</style>
