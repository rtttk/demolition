<template>
  <view class="team-card" @click="$emit('click')">
    <!-- 团队头像 + 基本信息 -->
    <view class="card-main">
      <image
        class="team-avatar"
        :src="team.avatar || '/static/logo.png'"
        mode="aspectFill"
      />
      <view class="team-info">
        <text class="team-name">{{ team.name || '施工团队' }}</text>
        <view class="team-tags">
          <text class="tag">{{ team.specialty || '专业拆除' }}</text>
          <text v-if="team.experience" class="tag">{{ team.experience }}年经验</text>
        </view>
        <view class="team-rating">
          <text class="star">&#9733;</text>
          <text class="rating-score">{{ team.rating || '5.0' }}</text>
          <text class="rating-count">({{ team.reviewCount || 0 }}条评价)</text>
        </view>
      </view>
    </view>

    <!-- 底部统计 -->
    <view class="card-footer">
      <view class="stat-item">
        <text class="stat-value">{{ team.orderCount || 0 }}</text>
        <text class="stat-label">成交订单</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-value">{{ team.completionRate || '100%' }}</text>
        <text class="stat-label">完工率</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-value">{{ team.onTimeRate || '100%' }}</text>
        <text class="stat-label">准时率</text>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  // 团队对象
  team: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['click'])
</script>

<style lang="scss" scoped>
.team-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
  box-shadow: $shadow-sm;
}

.card-main {
  display: flex;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.team-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: $radius-md;
  flex-shrink: 0;
}

.team-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.team-name {
  font-size: $font-size-md;
  font-weight: bold;
  color: $text-title;
  margin-bottom: 8rpx;
}

.team-tags {
  display: flex;
  gap: 12rpx;
  margin-bottom: 8rpx;

  .tag {
    font-size: $font-size-xs;
    color: $primary-color;
    padding: 2rpx 12rpx;
    background-color: $primary-light;
    border-radius: $radius-sm;
  }
}

.team-rating {
  display: flex;
  align-items: center;
  gap: 4rpx;

  .star {
    font-size: $font-size-sm;
    color: #FFB800;
  }

  .rating-score {
    font-size: $font-size-sm;
    font-weight: bold;
    color: $text-main;
  }

  .rating-count {
    font-size: $font-size-xs;
    color: $text-placeholder;
  }
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-top: 20rpx;
  border-top: 1rpx solid $border-color;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: $font-size-md;
  font-weight: bold;
  color: $text-title;
  margin-bottom: 4rpx;
}

.stat-label {
  font-size: $font-size-xs;
  color: $text-placeholder;
}

.stat-divider {
  width: 1rpx;
  height: 48rpx;
  background-color: $border-color;
}
</style>
