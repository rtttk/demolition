<template>
  <view class="upload-case-page">
    <!-- 表单 -->
    <view class="form-section">
      <view class="form-item">
        <text class="form-label required">案例标题</text>
        <input class="form-input" type="text" v-model="form.title" placeholder="请输入案例标题" maxlength="50" />
      </view>

      <view class="form-item" @click="showDemoTypePicker">
        <text class="form-label required">拆除类型</text>
        <view class="form-value">
          <text :class="['value-text', { placeholder: !form.demoTypeName }]">
            {{ form.demoTypeName || '请选择拆除类型' }}
          </text>
          <text class="arrow" decode>{{ '>' }}</text>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">拆除面积</text>
        <view class="form-value form-value--input">
          <input class="form-input" type="digit" v-model="form.area" placeholder="请输入面积" />
          <text class="unit">m²</text>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">项目地址</text>
        <input class="form-input" type="text" v-model="form.address" placeholder="请输入项目地址" maxlength="200" />
      </view>

      <view class="form-item">
        <text class="form-label">施工工期</text>
        <view class="form-value form-value--input">
          <input class="form-input" type="number" v-model="form.duration" placeholder="请输入工期天数" />
          <text class="unit">天</text>
        </view>
      </view>

      <view class="form-item form-item--textarea">
        <text class="form-label required">案例描述</text>
        <textarea
          class="form-textarea"
          v-model="form.description"
          placeholder="请详细描述案例情况"
          maxlength="1000"
          :auto-height="true"
        />
        <text class="char-count">{{ (form.description || '').length }}/1000</text>
      </view>

      <view class="form-item form-item--upload">
        <text class="form-label required">施工前照片</text>
        <text class="upload-tip">至少上传1张，最多9张</text>
        <image-upload v-model="form.beforeImages" :maxCount="9" @update:fileIds="form.beforeImageIds = $event" />
      </view>

      <view class="form-item form-item--upload">
        <text class="form-label">施工后照片</text>
        <text class="upload-tip">最多9张</text>
        <image-upload v-model="form.afterImages" :maxCount="9" @update:fileIds="form.afterImageIds = $event" />
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section safe-area-bottom">
      <view class="submit-btn" @click="handleSubmit">
        <text class="submit-text">发布案例</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import ImageUpload from '@/components/image-upload/image-upload.vue'
import { DEMO_TYPE_OPTIONS } from '@/utils/constants'
import { createCase } from '@/api/case'
import { showLoading, hideLoading, showSuccess } from '@/utils/util'

const form = reactive({
  title: '',
  demoType: null,
  demoTypeName: '',
  area: '',
  address: '',
  duration: '',
  description: '',
  beforeImages: [],
  beforeImageIds: [],
  afterImages: [],
  afterImageIds: []
})

function showDemoTypePicker() {
  const labels = DEMO_TYPE_OPTIONS.map(t => t.label)
  uni.showActionSheet({
    itemList: labels,
    success: (res) => {
      form.demoType = DEMO_TYPE_OPTIONS[res.tapIndex].value
      form.demoTypeName = DEMO_TYPE_OPTIONS[res.tapIndex].label
    }
  })
}

async function handleSubmit() {
  if (!form.title) return uni.showToast({ title: '请输入案例标题', icon: 'none' })
  if (!form.demoType) return uni.showToast({ title: '请选择拆除类型', icon: 'none' })
  if (!form.description) return uni.showToast({ title: '请输入案例描述', icon: 'none' })
  if (form.beforeImageIds.length === 0) return uni.showToast({ title: '请上传至少1张施工前照片', icon: 'none' })

  showLoading('发布中...')
  try {
    await createCase({
      title: form.title,
      demoType: form.demoType,
      address: form.address || undefined,
      area: form.area ? Number(form.area) : undefined,
      duration: form.duration ? Number(form.duration) : undefined,
      description: form.description,
      beforeImageIds: form.beforeImageIds,
      afterImageIds: form.afterImageIds.length > 0 ? form.afterImageIds : undefined
    })
    hideLoading()
    showSuccess('发布成功')
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    hideLoading()
    console.error('发布案例失败:', error)
  }
}
</script>

<style lang="scss" scoped>
.upload-case-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 140rpx;
}

.form-section {
  background-color: $bg-card;
  padding: 28rpx 32rpx;
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
  margin-bottom: 12rpx;
  display: block;

  &.required::before {
    content: '*';
    color: $error-color;
    margin-right: 4rpx;
  }
}

.form-input {
  font-size: $font-size-base;
  color: $text-main;
  height: 72rpx;
  padding: 0 20rpx;
  background-color: $bg-gray;
  border-radius: $radius-md;
}

.form-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72rpx;

  &--input {
    gap: 8rpx;
    background-color: $bg-gray;
    border-radius: $radius-md;
    padding: 0 20rpx;
  }
}

.value-text {
  font-size: $font-size-base;
  color: $text-main;

  &.placeholder {
    color: $text-placeholder;
  }
}

.arrow {
  font-size: $font-size-sm;
  color: $text-placeholder;
}

.unit {
  font-size: $font-size-base;
  color: $text-secondary;
  white-space: nowrap;
}

.form-textarea {
  font-size: $font-size-base;
  color: $text-main;
  width: 100%;
  min-height: 200rpx;
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
