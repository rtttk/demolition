<template>
  <view class="detail-page">
    <!-- 状态头部 -->
    <view class="status-header" :style="{ backgroundColor: statusColor }">
      <text class="status-text">{{ demand.statusName || '待报价' }}</text>
    </view>

    <!-- 基本信息 -->
    <view class="info-section">
      <text class="section-title">基本信息</text>
      <view class="info-grid">
        <view class="info-item">
          <text class="info-label">拆除类型</text>
          <text class="info-value">{{ demand.demoTypeName || '--' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">拆除面积</text>
          <text class="info-value">{{ demand.area ? demand.area + 'm²' : '--' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">所在区域</text>
          <text class="info-value">{{ demand.district || '--' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">详细地址</text>
          <text class="info-value">{{ demand.address || '--' }}</text>
        </view>
        <view class="info-item" v-if="demand.floorInfo">
          <text class="info-label">楼层/高度</text>
          <text class="info-value">{{ demand.floorInfo }}</text>
        </view>
        <view class="info-item" v-if="demand.expectedTime">
          <text class="info-label">期望时间</text>
          <text class="info-value">{{ demand.expectedTime }}</text>
        </view>
        <view class="info-item" v-if="demand.budget">
          <text class="info-label">预算范围</text>
          <text class="info-value price">{{ demand.budget }}</text>
        </view>
      </view>
      <view v-if="demand.description" class="desc-section">
        <text class="info-label">需求描述</text>
        <text class="desc-text">{{ demand.description }}</text>
      </view>
    </view>

    <!-- 图片展示 -->
    <view v-if="demand.images && demand.images.length > 0" class="image-section">
      <text class="section-title">现场照片</text>
      <swiper
        class="image-swiper"
        :indicator-dots="demand.images.length > 1"
        :autoplay="false"
        indicator-color="rgba(0,0,0,0.3)"
        indicator-active-color="#FFFFFF"
      >
        <swiper-item v-for="(img, index) in demand.images" :key="index">
          <image
            class="swiper-image"
            :src="img"
            mode="aspectFill"
            @click="previewImage(index)"
          />
        </swiper-item>
      </swiper>
    </view>

    <!-- 联系信息 -->
    <view class="contact-section">
      <text class="section-title">联系信息</text>
      <view class="contact-info">
        <view class="contact-item">
          <text class="contact-label">联系人</text>
          <text class="contact-value">{{ demand.contactName || '--' }}</text>
        </view>
        <view class="contact-item">
          <text class="contact-label">联系电话</text>
          <text class="contact-value">{{ maskedPhone }}</text>
          <view class="call-btn" @click="makeCall">
            <text class="call-text">拨打</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 报价列表 -->
    <view v-if="quoteList.length > 0" class="quote-section">
      <text class="section-title">报价列表 ({{ quoteList.length }})</text>
      <view
        v-for="(quote, index) in quoteList"
        :key="quote.id || index"
        class="quote-card"
      >
        <view class="quote-header">
          <view class="team-info">
            <image class="team-avatar" :src="quote.teamAvatar || '/static/logo.png'" mode="aspectFill" />
            <view class="team-detail">
              <text class="team-name">{{ quote.teamName || '施工团队' }}</text>
              <text class="quote-time">{{ quote.createTime || '' }}</text>
            </view>
          </view>
          <text class="quote-price">¥{{ quote.price || '--' }}</text>
        </view>
        <view v-if="quote.description" class="quote-desc">
          <text class="desc-text">{{ quote.description }}</text>
        </view>
        <view class="quote-footer">
          <text class="quote-days">预计工期：{{ quote.estimatedDays || '--' }}天</text>
          <view v-if="canSelectQuote" class="select-btn" @click="handleSelectQuote(quote)">
            <text class="select-text">选择此报价</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作 -->
    <view v-if="canSelectQuote" class="bottom-action safe-area-bottom">
      <view class="action-btn" @click="showQuoteList">
        <text class="action-text">选择报价 ({{ quoteList.length }})</text>
      </view>
    </view>

    <view class="safe-bottom" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getDemandDetail } from '@/api/demand'
import { selectQuote } from '@/api/demand'
import { maskPhone, makePhoneCall, previewImage as previewImageUtil, showLoading, hideLoading, showSuccess, showConfirm } from '@/utils/util'
import { DEMAND_STATUS_COLOR } from '@/utils/constants'

const demandId = ref(null)
const demand = ref({})
const quoteList = ref([])

const statusColor = computed(() => {
  return DEMAND_STATUS_COLOR[demand.value.status] || '#999999'
})

const maskedPhone = computed(() => {
  return maskPhone(demand.value.contactPhone)
})

const canSelectQuote = computed(() => {
  return demand.value.status === 1 && quoteList.value.length > 0
})

async function loadDetail() {
  if (!demandId.value) return

  showLoading()
  try {
    const res = await getDemandDetail(demandId.value)
    const data = res.data || res
    demand.value = data.demand || data
    quoteList.value = data.quotes || []
  } catch (error) {
    console.error('获取需求详情失败:', error)
  } finally {
    hideLoading()
  }
}

async function handleSelectQuote(quote) {
  const confirmed = await showConfirm(`确认选择 ${quote.teamName} 的报价?`)
  if (!confirmed) return

  showLoading('提交中...')
  try {
    await selectQuote(demandId.value, { quoteId: quote.id })
    hideLoading()
    showSuccess('选择成功')
    loadDetail()
  } catch (error) {
    hideLoading()
  }
}

function makeCall() {
  makePhoneCall(demand.value.contactPhone)
}

function previewImage(index) {
  previewImageUtil(demand.value.images[index], demand.value.images)
}

function showQuoteList() {
  // 滚动到报价列表区域
}

onLoad((options) => {
  demandId.value = options.id
  loadDetail()
})
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background-color: $bg-page;
}

.status-header {
  padding: 40rpx 32rpx;
  display: flex;
  align-items: center;
}

.status-text {
  font-size: $font-size-xl;
  font-weight: bold;
  color: #FFFFFF;
}

.info-section,
.image-section,
.contact-section,
.quote-section {
  background-color: $bg-card;
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: $font-size-md;
  font-weight: bold;
  color: $text-title;
  margin-bottom: 24rpx;
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

.desc-section {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid $border-color-light;
}

.desc-text {
  font-size: $font-size-sm;
  color: $text-secondary;
  line-height: 1.6;
  margin-top: 8rpx;
}

.image-swiper {
  height: 400rpx;
  border-radius: $radius-md;
  overflow: hidden;
}

.swiper-image {
  width: 100%;
  height: 100%;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.contact-item {
  display: flex;
  align-items: center;
}

.contact-label {
  font-size: $font-size-sm;
  color: $text-placeholder;
  width: 160rpx;
  flex-shrink: 0;
}

.contact-value {
  flex: 1;
  font-size: $font-size-sm;
  color: $text-main;
}

.call-btn {
  padding: 8rpx 24rpx;
  background-color: $primary-color;
  border-radius: $radius-round;

  .call-text {
    font-size: $font-size-sm;
    color: #FFFFFF;
  }
}

.quote-card {
  padding: 24rpx;
  background-color: $bg-gray;
  border-radius: $radius-md;
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.quote-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.team-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.team-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
}

.team-detail {
  display: flex;
  flex-direction: column;
}

.team-name {
  font-size: $font-size-base;
  font-weight: bold;
  color: $text-title;
}

.quote-time {
  font-size: $font-size-xs;
  color: $text-placeholder;
}

.quote-price {
  font-size: $font-size-xl;
  font-weight: bold;
  color: $primary-color;
}

.quote-desc {
  margin-bottom: 16rpx;
}

.quote-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16rpx;
  border-top: 1rpx solid $border-color;
}

.quote-days {
  font-size: $font-size-xs;
  color: $text-secondary;
}

.select-btn {
  padding: 8rpx 24rpx;
  background-color: $primary-color;
  border-radius: $radius-round;

  .select-text {
    font-size: $font-size-sm;
    color: #FFFFFF;
  }
}

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
