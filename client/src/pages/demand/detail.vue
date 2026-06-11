<template>
  <view class="detail-page">
    <!-- 状态头部 -->
    <view class="status-header" :style="{ backgroundColor: statusColor }">
      <text class="status-text">{{ demand.statusName || '待报价' }}</text>
    </view>

    <!-- 基本信息卡片 -->
    <view class="content-card">
      <text class="section-title">基本信息</text>
      <view class="info-grid">
        <view class="info-item">
          <text class="info-label">拆除类型</text>
          <text class="info-value">{{ demoTypeName }}</text>
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
        <view class="info-item full-width" v-if="demand.budget">
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

    <!-- 联系信息卡片 -->
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

    <!-- 报价列表卡片 -->
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

    <!-- 服务方报价按钮 -->
    <view v-if="canSubmitQuote" class="bottom-action safe-area-bottom">
      <view class="action-btn primary" @click="showQuoteModal = true">
        <text class="action-text">提交报价</text>
      </view>
    </view>

    <!-- 已报价提示 -->
    <view v-if="fromProvider && hasQuoted" class="bottom-action safe-area-bottom">
      <view class="action-btn disabled">
        <text class="action-text">已报价</text>
      </view>
    </view>

    <view class="safe-bottom" />
  </view>

  <!-- 报价弹窗 -->
  <view v-if="showQuoteModal" class="quote-modal-mask" @click="showQuoteModal = false">
    <view class="quote-modal" @click.stop>
      <view class="modal-header">
        <text class="modal-title">提交报价</text>
        <view class="modal-close" @click="showQuoteModal = false">
          <text class="close-icon">×</text>
        </view>
      </view>
      <view class="modal-body">
        <view class="form-item">
          <text class="form-label">报价金额</text>
          <view class="form-input-wrap">
            <text class="input-prefix">¥</text>
            <input 
              class="form-input" 
              type="digit" 
              v-model="quotePrice" 
              placeholder="请输入报价金额"
            />
          </view>
        </view>
        <view class="form-item">
          <text class="form-label">预计工期</text>
          <view class="form-input-wrap">
            <input 
              class="form-input" 
              type="number" 
              v-model="quoteDuration" 
              placeholder="请输入预计天数"
            />
            <text class="input-suffix">天</text>
          </view>
        </view>
        <view class="form-item">
          <text class="form-label">施工方案</text>
          <textarea 
            class="form-textarea" 
            v-model="quotePlan" 
            placeholder="请简要描述施工方案（可选）"
            :maxlength="500"
          />
        </view>
      </view>
      <view class="modal-footer">
        <view class="modal-btn cancel" @click="showQuoteModal = false">
          <text class="btn-text">取消</text>
        </view>
        <view class="modal-btn confirm" @click="handleSubmitQuote">
          <text class="btn-text">确认报价</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getDemandDetail } from '@/api/demand'
import { selectQuote } from '@/api/demand'
import { getFileInfo } from '@/api/file'
import { submitQuote, checkQuote } from '@/api/quote'
import { maskPhone, makePhoneCall, previewImage as previewImageUtil, showLoading, hideLoading, showSuccess, showConfirm, showToast } from '@/utils/util'
import { DEMAND_STATUS_COLOR, DEMO_TYPES } from '@/utils/constants'

const demandId = ref(null)
const demand = ref({})
const quoteList = ref([])
const fromProvider = ref(false)
const hasQuoted = ref(false)
const showQuoteModal = ref(false)
const quotePrice = ref('')
const quoteDuration = ref('')
const quotePlan = ref('')

const statusColor = computed(() => {
  return DEMAND_STATUS_COLOR[demand.value.status] || '#999999'
})

const demoTypeName = computed(() => {
  return DEMO_TYPES[demand.value.demoType] || '--'
})

const maskedPhone = computed(() => {
  return maskPhone(demand.value.contactPhone)
})

const canSelectQuote = computed(() => {
  return demand.value.status === 1 && quoteList.value.length > 0
})

const canSubmitQuote = computed(() => {
  return fromProvider.value && demand.value.status === 0 && !hasQuoted.value
})

async function loadDetail() {
  if (!demandId.value) return

  showLoading()
  try {
    const res = await getDemandDetail(demandId.value)
    const data = res.data || res
    const demandData = data.demand || data

    // 处理图片 - 从 imageIds 获取图片URL
    if (demandData.imageIds && demandData.imageIds.length > 0) {
      const imagePromises = demandData.imageIds.map(id => getFileInfo(id))
      const imageResults = await Promise.all(imagePromises)
      demandData.images = imageResults.map(r => {
        const fileData = r.data || r
        return fileData.fileUrl || fileData.url || ''
      }).filter(url => url)
    } else {
      demandData.images = []
    }

    demand.value = demandData
    quoteList.value = data.quotes || []

    // 如果是服务方，检查是否已报价
    if (fromProvider.value) {
      const quoteRes = await checkQuote(demandId.value)
      hasQuoted.value = quoteRes.data?.quoted || false
    }
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

async function handleSubmitQuote() {
  if (!quotePrice.value) {
    showToast('请输入报价金额')
    return
  }

  const confirmed = await showConfirm(`确认提交报价 ¥${quotePrice.value}?`)
  if (!confirmed) return

  showLoading('提交中...')
  try {
    await submitQuote({
      demandId: demandId.value,
      price: quotePrice.value,
      duration: quoteDuration.value || undefined,
      planSummary: quotePlan.value || undefined
    })
    hideLoading()
    showSuccess('报价成功')
    showQuoteModal.value = false
    hasQuoted.value = true
    quotePrice.value = ''
    quoteDuration.value = ''
    quotePlan.value = ''
    loadDetail()
  } catch (error) {
    hideLoading()
    showToast('报价失败')
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
  fromProvider.value = options.from === 'provider'
  loadDetail()
})
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background-color: $bg-page;
}

// 状态头部 - 极简风格
.status-header {
  padding: 48rpx 32rpx;

  .status-text {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: #FFFFFF;
  }
}

// 内容卡片
.content-card {
  margin: 0 $spacing-8;
  margin-top: -32rpx;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-6;
  box-shadow: $shadow-md;
}

// 基本信息
.section-title {
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $text-title;
  margin-bottom: $spacing-5;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-5;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;

  &.full-width {
    grid-column: 1 / -1;
  }
}

.info-label {
  font-size: $font-size-xs;
  color: $text-placeholder;
}

.info-value {
  font-size: $font-size-sm;
  color: $text-main;

  &.price {
    color: $primary-color;
    font-weight: $font-weight-bold;
  }
}

// 描述区块
.desc-section {
  margin-top: $spacing-5;
  padding-top: $spacing-5;
  border-top: 1rpx solid $border-color-light;
}

.desc-text {
  font-size: $font-size-sm;
  color: $text-secondary;
  line-height: 1.6;
}

// 图片展示
.image-section {
  margin: $spacing-5 $spacing-8;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-6;
  box-shadow: $shadow-sm;

  .section-title {
    margin-bottom: $spacing-4;
  }
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

// 联系信息
.contact-section {
  margin: $spacing-5 $spacing-8;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-6;
  box-shadow: $shadow-sm;

  .section-title {
    margin-bottom: $spacing-4;
  }
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: $spacing-3;
}

.contact-label {
  font-size: $font-size-sm;
  color: $text-placeholder;
  width: 120rpx;
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
  border-radius: $radius-full;

  .call-text {
    font-size: $font-size-xs;
    color: #FFFFFF;
  }
}

// 报价列表
.quote-section {
  margin: $spacing-5 $spacing-8;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-6;
  box-shadow: $shadow-sm;

  .section-title {
    margin-bottom: $spacing-4;
  }
}

.quote-card {
  padding: $spacing-5;
  background-color: $bg-gray;
  border-radius: $radius-md;
  margin-bottom: $spacing-4;

  &:last-child {
    margin-bottom: 0;
  }
}

.quote-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-4;
}

.team-info {
  display: flex;
  align-items: center;
  gap: $spacing-3;
}

.team-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
}

.team-detail {
  display: flex;
  flex-direction: column;
}

.team-name {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-title;
}

.quote-time {
  font-size: $font-size-xs;
  color: $text-placeholder;
}

.quote-price {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $primary-color;
}

.quote-desc {
  margin-bottom: $spacing-3;

  .desc-text {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.quote-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: $spacing-3;
  border-top: 1rpx solid $border-color;
}

.quote-days {
  font-size: $font-size-xs;
  color: $text-secondary;
}

.select-btn {
  padding: 8rpx 24rpx;
  background-color: $primary-color;
  border-radius: $radius-full;

  .select-text {
    font-size: $font-size-xs;
    color: #FFFFFF;
  }
}

// 底部操作
.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-4 $spacing-8;
  padding-bottom: calc($spacing-4 + env(safe-area-inset-bottom));
  background-color: $bg-card;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.action-btn {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $primary-color;
  border-radius: $radius-md;

  &:active {
    opacity: 0.9;
  }

  &.disabled {
    background-color: $border-color;

    .action-text {
      color: $text-placeholder;
    }
  }

  .action-text {
    font-size: $font-size-md;
    font-weight: $font-weight-medium;
    color: #FFFFFF;
  }
}

.safe-bottom {
  height: 140rpx;
}

// 报价弹窗
.quote-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.quote-modal {
  width: 100%;
  background-color: $bg-card;
  border-radius: $radius-xl $radius-xl 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-5 $spacing-6;
  border-bottom: 1rpx solid $border-color-light;
}

.modal-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $text-title;
}

.modal-close {
  padding: $spacing-2;
}

.close-icon {
  font-size: 40rpx;
  color: $text-placeholder;
}

.modal-body {
  padding: $spacing-6;
}

.form-item {
  margin-bottom: $spacing-5;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  font-size: $font-size-sm;
  color: $text-secondary;
  margin-bottom: $spacing-3;
  display: block;
}

.form-input-wrap {
  display: flex;
  align-items: center;
  background-color: $bg-gray;
  border-radius: $radius-md;
  padding: 0 $spacing-4;
}

.input-prefix,
.input-suffix {
  font-size: $font-size-base;
  color: $text-placeholder;
}

.form-input {
  flex: 1;
  height: 80rpx;
  font-size: $font-size-base;
  color: $text-title;
}

.form-textarea {
  width: 100%;
  height: 160rpx;
  background-color: $bg-gray;
  border-radius: $radius-md;
  padding: $spacing-4;
  font-size: $font-size-sm;
  color: $text-title;
}

.modal-footer {
  display: flex;
  gap: $spacing-4;
  padding: $spacing-5 $spacing-6;
  border-top: 1rpx solid $border-color-light;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;

  &.cancel {
    background-color: $bg-gray;

    .btn-text {
      color: $text-secondary;
    }
  }

  &.confirm {
    background-color: $primary-color;

    .btn-text {
      color: #FFFFFF;
    }
  }
}

.btn-text {
  font-size: $font-size-md;
  font-weight: $font-weight-medium;
}
</style>
