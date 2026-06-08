<template>
  <view class="team-home-page">
    <!-- 团队头部 -->
    <view class="team-header">
      <image class="team-avatar" :src="team.avatar || '/static/logo.png'" mode="aspectFill" />
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

    <!-- 统计数据 -->
    <view class="stats-section">
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

    <!-- 团队简介 -->
    <view v-if="team.description" class="desc-section">
      <text class="section-title">团队简介</text>
      <text class="desc-text">{{ team.description }}</text>
    </view>

    <!-- 团队案例 -->
    <view class="case-section">
      <view class="section-header">
        <text class="section-title">施工案例</text>
        <text class="view-all" @click="goCaseList">查看全部 ></text>
      </view>
      <view v-if="caseList.length > 0" class="case-list">
        <case-card
          v-for="(item, index) in caseList"
          :key="item.id || index"
          :caseItem="item"
          @click="goCaseDetail(item)"
        />
      </view>
      <empty-state v-else icon="empty" title="暂无案例" />
    </view>

    <!-- 用户评价 -->
    <view class="review-section">
      <view class="section-header">
        <text class="section-title">用户评价</text>
      </view>
      <view v-if="reviewList.length > 0" class="review-list">
        <view v-for="(review, index) in reviewList" :key="index" class="review-item">
          <view class="review-header">
            <text class="reviewer">{{ review.userName || '匿名用户' }}</text>
            <view class="review-stars">
              <text v-for="s in 5" :key="s" class="review-star" :class="{ active: s <= review.rating }">&#9733;</text>
            </view>
          </view>
          <text class="review-content">{{ review.content || '' }}</text>
          <view v-if="review.tags" class="review-tags">
            <text v-for="(tag, tIdx) in review.tags.split(',')" :key="tIdx" class="review-tag">{{ tag }}</text>
          </view>
          <text class="review-time">{{ review.createTime || '' }}</text>
        </view>
      </view>
      <empty-state v-else icon="empty" title="暂无评价" />
    </view>

    <view class="safe-bottom" />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import CaseCard from '@/components/case-card/case-card.vue'
import EmptyState from '@/components/empty-state/empty-state.vue'
import { getTeamDetail } from '@/api/team'
import { getCases } from '@/api/case'
import { getReviews } from '@/api/review'

const teamId = ref(null)
const team = ref({})
const caseList = ref([])
const reviewList = ref([])

async function loadTeamDetail() {
  if (!teamId.value) return

  try {
    const res = await getTeamDetail(teamId.value)
    team.value = res.data || res
  } catch (error) {
    console.error('获取团队详情失败:', error)
  }

  // 加载案例
  try {
    const caseRes = await getCases({ teamId: teamId.value, page: 1, size: 5 })
    const caseData = caseRes.data || caseRes
    caseList.value = caseData.list || caseData.records || []
  } catch (error) {
    console.error('获取案例失败:', error)
  }

  // 加载评价
  try {
    const reviewRes = await getReviews({ teamId: teamId.value, page: 1, size: 5 })
    const reviewData = reviewRes.data || reviewRes
    reviewList.value = reviewData.list || reviewData.records || []
  } catch (error) {
    console.error('获取评价失败:', error)
  }
}

function goCaseList() {
  uni.navigateTo({ url: `/pages/case/list?teamId=${teamId.value}` })
}

function goCaseDetail(item) {
  uni.navigateTo({ url: `/pages/case/detail?id=${item.id}` })
}

onLoad((options) => {
  teamId.value = options.id
  loadTeamDetail()
})
</script>

<style lang="scss" scoped>
.team-home-page {
  min-height: 100vh;
  background-color: $bg-page;
}

.team-header {
  background-color: $bg-card;
  padding: 40rpx 32rpx;
  display: flex;
  gap: 24rpx;
}

.team-avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: $radius-lg;
  flex-shrink: 0;
}

.team-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.team-name {
  font-size: $font-size-xl;
  font-weight: bold;
  color: $text-title;
  margin-bottom: 12rpx;
}

.team-tags {
  display: flex;
  gap: 12rpx;
  margin-bottom: 12rpx;

  .tag {
    font-size: $font-size-xs;
    color: $primary-color;
    padding: 4rpx 16rpx;
    background-color: $primary-light;
    border-radius: $radius-sm;
  }
}

.team-rating {
  display: flex;
  align-items: center;
  gap: 4rpx;

  .star { font-size: $font-size-base; color: #FFB800; }
  .rating-score { font-size: $font-size-base; font-weight: bold; color: $text-main; }
  .rating-count { font-size: $font-size-xs; color: $text-placeholder; }
}

.stats-section {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: $bg-card;
  padding: 28rpx 32rpx;
  margin-top: 2rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: $font-size-xl;
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

.desc-section,
.case-section,
.review-section {
  background-color: $bg-card;
  padding: 28rpx 32rpx;
  margin-top: 20rpx;
}

.section-title {
  font-size: $font-size-md;
  font-weight: bold;
  color: $text-title;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;

  .section-title {
    margin-bottom: 0;
  }
}

.view-all {
  font-size: $font-size-sm;
  color: $primary-color;
}

.desc-text {
  font-size: $font-size-sm;
  color: $text-secondary;
  line-height: 1.8;
}

.case-list {
  display: flex;
  gap: 20rpx;
  overflow-x: auto;
  padding-bottom: 8rpx;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.review-item {
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid $border-color-light;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.reviewer {
  font-size: $font-size-base;
  font-weight: bold;
  color: $text-title;
}

.review-stars {
  display: flex;
  gap: 4rpx;

  .review-star {
    font-size: $font-size-sm;
    color: $border-color;

    &.active {
      color: #FFB800;
    }
  }
}

.review-content {
  font-size: $font-size-sm;
  color: $text-main;
  line-height: 1.6;
  display: block;
  margin-bottom: 12rpx;
}

.review-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.review-tag {
  font-size: $font-size-xs;
  color: $primary-color;
  padding: 2rpx 12rpx;
  background-color: $primary-light;
  border-radius: $radius-sm;
}

.review-time {
  font-size: $font-size-xs;
  color: $text-placeholder;
}

.safe-bottom {
  height: 40rpx;
}
</style>
