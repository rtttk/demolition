<template>
  <view class="submit-quote-page">
    <!-- 需求信息 -->
    <view class="demand-section">
      <text class="section-title">需求信息</text>
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
          <text class="info-label">施工地址</text>
          <text class="info-value">{{ demand.address || '--' }}</text>
        </view>
      </view>
    </view>

    <!-- 报价表单 -->
    <view class="form-section">
      <text class="section-title">填写报价</text>

      <!-- 报价金额 -->
      <view class="form-item">
        <text class="form-label required">报价金额</text>
        <view class="price-input">
          <text class="price-unit">¥</text>
          <input
            class="form-input"
            type="digit"
            v-model="form.price"
            placeholder="请输入报价金额"
          />
          <text class="price-unit">元</text>
        </view>
      </view>

      <!-- 预计工期 -->
      <view class="form-item">
        <text class="form-label required">预计工期</text>
        <view class="days-input">
          <input
            class="form-input"
            type="number"
            v-model="form.duration"
            placeholder="请输入天数"
          />
          <text class="days-unit">天</text>
        </view>
      </view>

      <!-- 施工方案 -->
      <view class="form-item form-item--textarea">
        <text class="form-label">施工方案</text>
        <textarea
          class="form-textarea"
          v-model="form.planSummary"
          placeholder="请描述施工方案，如施工步骤、材料费用等"
          maxlength="500"
          :auto-height="true"
        />
        <text class="char-count">{{ (form.planSummary || '').length }}/500</text>
      </view>

      <!-- 备注 -->
      <view class="form-item form-item--textarea">
        <text class="form-label">备注</text>
        <textarea
          class="form-textarea"
          v-model="form.remark"
          placeholder="其他需要说明的事项"
          maxlength="200"
          :auto-height="true"
        />
        <text class="char-count">{{ (form.remark || '').length }}/200</text>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section safe-area-bottom">
      <view class="submit-btn" :class="{ disabled: alreadyQuoted }" @click="handleSubmit">
        <text class="submit-text">{{ alreadyQuoted ? '已报价' : '提交报价' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getDemandDetail } from '@/api/demand'
import { submitQuote, checkQuote } from '@/api/quote'
import { showLoading, hideLoading, showSuccess } from '@/utils/util'

const demandId = ref(null)
const demand = ref({})
const alreadyQuoted = ref(false)
const form = reactive({
  price: '',
  duration: '',
  planSummary: '',
  remark: ''
})

async function loadDemand() {
  if (!demandId.value) return

  try {
    const res = await getDemandDetail(demandId.value)
    demand.value = res.data?.demand || res.data || res
  } catch (error) {
    console.error('获取需求详情失败:', error)
  }

  // 检查是否已报价
  try {
    const checkRes = await checkQuote(demandId.value)
    if (checkRes.data?.quoted || checkRes.data?.exists) {
      alreadyQuoted.value = true
      uni.showToast({ title: '您已对此需求报过价', icon: 'none' })
    }
  } catch (error) {
    // 忽略
  }
}

async function handleSubmit() {
  if (alreadyQuoted.value) return
  if (!form.price) return uni.showToast({ title: '请输入报价金额', icon: 'none' })
  if (!form.duration) return uni.showToast({ title: '请输入预计工期', icon: 'none' })

  showLoading('提交中...')
  try {
    await submitQuote({
      demandId: demandId.value,
      price: Number(form.price),
      duration: Number(form.duration),
      planSummary: form.planSummary || undefined,
      remark: form.remark || undefined
    })
    hideLoading()
    showSuccess('报价提交成功')
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    hideLoading()
    console.error('提交报价失败:', error)
  }
}

onLoad((options) => {
  demandId.value = options.demandId || options.id
  loadDemand()
})
</script>

<style lang="scss" scoped>
.submit-quote-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 140rpx;
}

.demand-section,
.form-section {
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
  gap: 16rpx;
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
}

.form-item {
  margin-bottom: 24rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  font-size: $font-size-base;
  color: $text-title;
  font-weight: bold;
  margin-bottom: 16rpx;
  display: block;

  &.required::before {
    content: '*';
    color: $error-color;
    margin-right: 4rpx;
  }
}

.price-input,
.days-input {
  display: flex;
  align-items: center;
  height: 80rpx;
  padding: 0 20rpx;
  background-color: $bg-gray;
  border-radius: $radius-md;
  gap: 8rpx;
}

.price-unit,
.days-unit {
  font-size: $font-size-base;
  color: $text-secondary;
  white-space: nowrap;
}

.form-input {
  flex: 1;
  font-size: $font-size-base;
  color: $text-main;
}

.form-textarea {
  font-size: $font-size-base;
  color: $text-main;
  width: 100%;
  min-height: 160rpx;
  padding: 20rpx;
  background-color: $bg-gray;
  border-radius: $radius-md;
  line-height: 1.6;
}

.char-count {
  font-size: $font-size-xs;
  color: $text-placeholder;
  text-align: right;
  display: block;
  margin-top: 8rpx;
}

.upload-tip {
  font-size: $font-size-xs;
  color: $text-placeholder;
  margin-bottom: 16rpx;
  display: block;
}

.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 32rpx;
  background-color: $bg-card;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.submit-btn {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $primary-color;
  border-radius: $radius-lg;

  &.disabled {
    background-color: $text-placeholder;
    opacity: 0.6;
  }

  &:active {
    opacity: 0.85;
  }
}

.submit-text {
  font-size: $font-size-lg;
  font-weight: bold;
  color: #FFFFFF;
}
</style>
