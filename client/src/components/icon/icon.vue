<!-- 通用图标组件 - 极简风格 -->
<template>
  <view class="icon-wrapper" :class="[`icon-${name}`, { 'icon-active': active }]" :style="iconStyle" @click="$emit('click')">
    <image v-if="svgSrc" :src="svgSrc" class="icon-image" mode="aspectFit" />
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 24
  },
  color: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const iconStyle = computed(() => ({
  width: `${props.size}rpx`,
  height: `${props.size}rpx`
}))

// 图标映射 - 使用 Unicode 符号和 SVG 路径
const iconMap = {
  // 首页相关
  home: { normal: '🏠', active: '🏠' },
  // 订单相关
  order: { normal: '📋', active: '📋' },
  // 消息相关
  message: { normal: '✉️', active: '✉️' },
  // 用户相关
  user: { normal: '👤', active: '👤' },
  profile: { normal: '👤', active: '👤' },
  // 功能相关
  publish: { normal: '✏️', active: '✏️' },
  search: { normal: '🔍', active: '🔍' },
  edit: { normal: '✏️', active: '✏️' },
  add: { normal: '➕', active: '➕' },
  delete: { normal: '🗑️', active: '🗑️' },
  setting: { normal: '⚙️', active: '⚙️' },
  // 导航相关
  back: { normal: '←', active: '←' },
  forward: { normal: '→', active: '→' },
  close: { normal: '✕', active: '✕' },
  check: { normal: '✓', active: '✓' },
  // 状态相关
  success: { normal: '✓', active: '✓' },
  warning: { normal: '⚠️', active: '⚠️' },
  error: { normal: '✕', active: '✕' },
  info: { normal: 'ℹ️', active: 'ℹ️' },
  // 其他
  star: { normal: '★', active: '★' },
  location: { normal: '📍', active: '📍' },
  phone: { normal: '📞', active: '📞' },
  more: { normal: '⋯', active: '⋯' }
}

const svgSrc = computed(() => {
  // 优先使用 SVG 文件
  const basePath = '/static/icons/'
  const suffix = props.active ? '-active' : ''
  return `${basePath}${props.name}${suffix}.svg`
})
</script>

<style lang="scss" scoped>
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-image {
  width: 100%;
  height: 100%;
}
</style>
