<template>
  <view class="case-card" @click="$emit('click')">
    <!-- 封面图 -->
    <view class="card-image">
      <image
        class="cover"
        :src="caseItem.coverImage || caseItem.images?.[0] || '/static/logo.png'"
        mode="aspectFill"
      />
      <view v-if="caseItem.demoTypeName" class="type-badge">
        <text class="badge-text">{{ caseItem.demoTypeName }}</text>
      </view>
    </view>

    <!-- 信息区域 -->
    <view class="card-info">
      <text class="case-title ellipsis-2">{{ caseItem.title || '拆除案例' }}</text>
      <view class="case-meta">
        <text class="meta-area" v-if="caseItem.area">{{ caseItem.area }}m²</text>
        <text class="meta-team ellipsis">{{ caseItem.teamName || '专业团队' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  // 案例对象
  caseItem: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['click'])
</script>

<style lang="scss" scoped>
.case-card {
  width: 320rpx;
  background-color: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  flex-shrink: 0;
}

.card-image {
  position: relative;
  width: 100%;
  height: 220rpx;
}

.cover {
  width: 100%;
  height: 100%;
}

.type-badge {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  padding: 4rpx 12rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: $radius-sm;

  .badge-text {
    font-size: $font-size-xs;
    color: #FFFFFF;
  }
}

.card-info {
  padding: 16rpx 20rpx 20rpx;
}

.case-title {
  font-size: $font-size-sm;
  font-weight: bold;
  color: $text-title;
  line-height: 1.4;
  height: 72rpx;
  margin-bottom: 12rpx;
}

.case-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.meta-area {
  font-size: $font-size-xs;
  color: $primary-color;
  font-weight: bold;
}

.meta-team {
  font-size: $font-size-xs;
  color: $text-placeholder;
  max-width: 160rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
