<template>
  <view class="status-tag" :style="{ backgroundColor: bgColor, color: textColor }">
    <text class="tag-text">{{ statusLabel }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { DEMAND_STATUS, DEMAND_STATUS_COLOR, ORDER_STATUS, ORDER_STATUS_COLOR, QUOTE_STATUS, QUOTE_STATUS_COLOR } from '@/utils/constants'

const props = defineProps({
  // 状态值
  status: {
    type: [Number, String],
    default: 0
  },
  // 类型: demand, order, quote
  type: {
    type: String,
    default: 'demand'
  }
})

const statusLabel = computed(() => {
  const num = Number(props.status)
  switch (props.type) {
    case 'demand':
      return DEMAND_STATUS[num] || '未知'
    case 'order':
      return ORDER_STATUS[num] || '未知'
    case 'quote':
      return QUOTE_STATUS[num] || '未知'
    default:
      return '未知'
  }
})

const bgColor = computed(() => {
  const num = Number(props.status)
  let colorMap
  switch (props.type) {
    case 'demand':
      colorMap = DEMAND_STATUS_COLOR
      break
    case 'order':
      colorMap = ORDER_STATUS_COLOR
      break
    case 'quote':
      colorMap = QUOTE_STATUS_COLOR
      break
    default:
      colorMap = {}
  }
  const color = colorMap[num] || '#999999'
  // 转为半透明背景
  return hexToRgba(color, 0.1)
})

const textColor = computed(() => {
  const num = Number(props.status)
  switch (props.type) {
    case 'demand':
      return DEMAND_STATUS_COLOR[num] || '#999999'
    case 'order':
      return ORDER_STATUS_COLOR[num] || '#999999'
    case 'quote':
      return QUOTE_STATUS_COLOR[num] || '#999999'
    default:
      return '#999999'
  }
})

/**
 * HEX 颜色转 RGBA
 */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
</script>

<style lang="scss" scoped>
.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 16rpx;
  border-radius: $radius-sm;
  white-space: nowrap;
  flex-shrink: 0;
}

.tag-text {
  font-size: $font-size-xs;
  line-height: 1.4;
}
</style>
