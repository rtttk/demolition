<template>
  <view class="order-detail-page">
    <!-- 状态进度条 -->
    <view class="progress-section">
      <view class="progress-bar">
        <view
          v-for="(step, index) in progressSteps"
          :key="index"
          class="progress-step"
          :class="{ active: index <= currentStep, current: index === currentStep }"
        >
          <view class="step-dot">
            <text v-if="index < currentStep" class="step-check">&#10003;</text>
          </view>
          <text class="step-label">{{ step.label }}</text>
          <view v-if="index < progressSteps.length - 1" class="step-line" :class="{ active: index < currentStep }" />
        </view>
      </view>
    </view>

    <!-- 团队信息 -->
    <view v-if="order.team" class="team-section">
      <text class="section-title">施工团队</text>
      <view class="team-card" @click="goTeamDetail">
        <image class="team-avatar" :src="order.team.avatar || '/static/logo.png'" mode="aspectFill" />
        <view class="team-detail">
          <text class="team-name">{{ order.team.name || '施工团队' }}</text>
          <text class="team-desc">{{ order.team.company?.name || '专业拆除' }}</text>
        </view>
        <text class="team-arrow" decode>{{ '>' }}</text>
      </view>
    </view>

    <!-- 需求信息 -->
    <view class="demand-section">
      <text class="section-title">需求信息</text>
      <view class="info-grid">
        <view class="info-item">
          <text class="info-label">需求标题</text>
          <text class="info-value">{{ order.demand?.title || '--' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">拆除类型</text>
          <text class="info-value">{{ order.demoTypeName || '--' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">拆除面积</text>
          <text class="info-value">{{ order.demand?.area ? order.demand.area + 'm²' : '--' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">所在区域</text>
          <text class="info-value">{{ order.demand?.district || '--' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">详细地址</text>
          <text class="info-value">{{ order.demand?.address || '--' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">联系人</text>
          <text class="info-value">{{ order.demand?.contactName || '--' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">联系电话</text>
          <text class="info-value">{{ order.demand?.contactPhone || '--' }}</text>
        </view>
        <view class="info-item" v-if="order.demand?.description">
          <text class="info-label">需求描述</text>
          <text class="info-value">{{ order.demand?.description }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">合同金额</text>
          <text class="info-value price">¥{{ order.amount || '--' }}</text>
        </view>
        <view class="info-item" v-if="order.planStartDate">
          <text class="info-label">计划开工</text>
          <text class="info-value">{{ order.planStartDate }}</text>
        </view>
      </view>
    </view>

    <!-- 最近施工日志 -->
    <view v-if="order.status === 3 && recentLogs.length > 0" class="log-section">
      <view class="section-header">
        <text class="section-title">施工动态</text>
        <text class="view-all" decode @click="goLogs">查看全部 {{ '>' }}</text>
      </view>
      <view
        v-for="(log, index) in recentLogs"
        :key="log.id || index"
        class="log-item"
      >
        <view class="log-dot" />
        <view class="log-content">
          <text class="log-text">{{ log.content || '' }}</text>
          <view class="log-images" v-if="log.imageUrls && log.imageUrls.length > 0">
            <image
              v-for="(img, imgIdx) in log.imageUrls.slice(0, 3)"
              :key="imgIdx"
              class="log-image"
              :src="img"
              mode="aspectFill"
            />
          </view>
          <text class="log-time">{{ log.createTime || '' }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view v-if="showConfirmBtn" class="bottom-action safe-area-bottom">
      <view class="action-btn" @click="handleConfirm">
        <text class="action-text">确认验收</text>
      </view>
    </view>

    <view v-if="showReviewBtn" class="bottom-action safe-area-bottom">
      <view class="action-btn" @click="goReview">
        <text class="action-text">去评价</text>
      </view>
    </view>

    <view class="safe-bottom" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrderDetail, confirmOrder } from '@/api/order'
import { getConstructionLogs } from '@/api/construction-log'
import { showLoading, hideLoading, showSuccess, showConfirm } from '@/utils/util'

const orderId = ref(null)
const order = ref({})
const recentLogs = ref([])

const progressSteps = ref([
  { label: '待审核' },
  { label: '待签约' },
  { label: '待开工' },
  { label: '施工中' },
  { label: '待验收' },
  { label: '已完成' }
])

const currentStep = computed(() => {
  const status = order.value.status
  // 0待审核 1待签约 2待开工 3施工中 4待验收 5已完成
  const map = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 }
  return map[status] ?? 0
})

const showConfirmBtn = computed(() => order.value.status === 4)
const showReviewBtn = computed(() => order.value.status === 5 && !order.value.reviewed)

async function loadDetail() {
  if (!orderId.value) return

  showLoading()
  try {
    const res = await getOrderDetail(orderId.value)
    order.value = res.data || res
  } catch (error) {
    console.error('获取订单详情失败:', error)
  } finally {
    hideLoading()
  }

  // 加载最近日志
  try {
    const logRes = await getConstructionLogs({ orderId: orderId.value, page: 1, size: 3 })
    const logData = logRes.data || logRes
    recentLogs.value = logData.list || logData.records || []
  } catch (error) {
    console.error('获取施工日志失败:', error)
  }
}

async function handleConfirm() {
  const confirmed = await showConfirm('确认工程已完工并验收?')
  if (!confirmed) return

  showLoading('提交中...')
  try {
    await confirmOrder(orderId.value)
    hideLoading()
    showSuccess('验收成功')
    loadDetail()
  } catch (error) {
    hideLoading()
  }
}

function goLogs() {
  uni.navigateTo({ url: `/pages/order/logs?orderId=${orderId.value}` })
}

function goReview() {
  uni.navigateTo({ url: `/pages/order/review?orderId=${orderId.value}&teamId=${order.value.teamId}` })
}

function goTeamDetail() {
  if (order.value.team?.id) {
    uni.navigateTo({ url: `/pages/team/home?id=${order.value.team.id}` })
  }
}

onLoad(async (options) => {
  orderId.value = options.id
  await loadDetail()
  // 如果从列表页带 action=accept 参数进来，自动弹出验收确认
  if (options.action === 'accept' && order.value.status === 4) {
    handleConfirm()
  }
})
</script>

<style lang="scss" scoped>
.order-detail-page {
  min-height: 100vh;
  background-color: $bg-page;
}

// 进度条
.progress-section {
  background-color: $bg-card;
  padding: 40rpx 32rpx;
  margin-bottom: 20rpx;
}

.progress-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.step-dot {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: $border-color;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  z-index: 1;

  .active & {
    background-color: $primary-color;
  }

  .current & {
    box-shadow: 0 0 0 8rpx rgba($primary-color, 0.2);
  }
}

.step-check {
  font-size: 20rpx;
  color: #FFFFFF;
}

.step-label {
  font-size: $font-size-xs;
  color: $text-placeholder;

  .active & {
    color: $primary-color;
    font-weight: bold;
  }
}

.step-line {
  position: absolute;
  top: 20rpx;
  left: calc(50% + 24rpx);
  width: calc(100% - 48rpx);
  height: 4rpx;
  background-color: $border-color;

  &.active {
    background-color: $primary-color;
  }
}

// 团队信息
.team-section {
  background-color: $bg-card;
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: $font-size-md;
  font-weight: bold;
  color: $text-title;
  margin-bottom: 20rpx;
}

.team-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.team-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
}

.team-detail {
  flex: 1;
}

.team-name {
  font-size: $font-size-base;
  font-weight: bold;
  color: $text-title;
  display: block;
  margin-bottom: 4rpx;
}

.team-desc {
  font-size: $font-size-xs;
  color: $text-secondary;
}

.team-arrow {
  font-size: $font-size-sm;
  color: $text-placeholder;
}

// 需求信息
.demand-section {
  background-color: $bg-card;
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.info-item {
  display: flex;
  align-items: flex-start;
}

.info-label {
  font-size: $font-size-sm;
  color: $text-placeholder;
  width: 160rpx;
  flex-shrink: 0;
}

.info-value {
  font-size: $font-size-sm;
  color: $text-main;
  flex: 1;

  &.price {
    color: $primary-color;
    font-weight: bold;
  }
}

// 施工日志
.log-section {
  background-color: $bg-card;
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.view-all {
  font-size: $font-size-sm;
  color: $primary-color;
}

.log-item {
  display: flex;
  gap: 20rpx;
  padding-bottom: 24rpx;
  position: relative;

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 10rpx;
    top: 28rpx;
    bottom: 0;
    width: 2rpx;
    background-color: $border-color;
  }
}

.log-dot {
  width: 22rpx;
  height: 22rpx;
  border-radius: 50%;
  background-color: $primary-color;
  flex-shrink: 0;
  margin-top: 6rpx;
}

.log-content {
  flex: 1;
}

.log-text {
  font-size: $font-size-sm;
  color: $text-main;
  line-height: 1.6;
  display: block;
  margin-bottom: 12rpx;
}

.log-images {
  display: flex;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.log-image {
  width: 140rpx;
  height: 140rpx;
  border-radius: $radius-sm;
}

.log-time {
  font-size: $font-size-xs;
  color: $text-placeholder;
}

// 底部操作
.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 32rpx;
  background-color: $bg-card;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.action-btn {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $primary-color;
  border-radius: $radius-lg;

  .action-text {
    font-size: $font-size-lg;
    font-weight: bold;
    color: #FFFFFF;
  }
}

.safe-bottom {
  height: 120rpx;
}
</style>
