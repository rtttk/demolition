<template>
  <view class="publish-page">
    <!-- 表单 -->
    <view class="form-section">
      <!-- 拆除类型 -->
      <view class="form-item" @click="showDemoTypePicker">
        <text class="form-label required">拆除类型</text>
        <view class="form-value">
          <text :class="['value-text', { placeholder: !form.demoTypeName }]">
            {{ form.demoTypeName || '请选择拆除类型' }}
          </text>
          <text class="arrow" decode>{{ '>' }}</text>
        </view>
      </view>

      <!-- 地址区域 - 条件显示 -->
      <template v-if="form.demoType === 1">
        <!-- 室内拆除：小区名称 -->
        <view class="form-item">
          <text class="form-label required">小区名称</text>
          <input
            class="form-input"
            type="text"
            v-model="form.communityName"
            placeholder="请输入小区名称"
            @blur="onCommunityBlur"
          />
        </view>
      </template>

      <template v-else>
        <!-- 非室内拆除：区域选择 -->
        <view class="form-item" @click="showDistrictPicker">
          <text class="form-label required">所在区域</text>
          <view class="form-value">
            <text :class="['value-text', { placeholder: !form.district }]">
              {{ form.district || '请选择区域' }}
            </text>
            <text class="arrow" decode>{{ '>' }}</text>
          </view>
        </view>
      </template>

      <!-- 详细地址 -->
      <view class="form-item">
        <text class="form-label required">详细地址</text>
        <input
          class="form-input"
          type="text"
          v-model="form.address"
          placeholder="请输入详细地址"
        />
      </view>

      <!-- 联系人 -->
      <view class="form-item">
        <text class="form-label required">联系人</text>
        <input
          class="form-input"
          type="text"
          v-model="form.contactName"
          placeholder="请输入称呼"
        />
      </view>

      <!-- 联系方式 -->
      <view class="form-item">
        <text class="form-label required">联系方式</text>
        <input
          class="form-input"
          type="number"
          v-model="form.contactPhone"
          placeholder="请输入联系电话"
          maxlength="11"
        />
      </view>

      <!-- 需求描述区域标题 -->
      <view class="section-title">
        <text class="section-title-text">需求描述（选填）</text>
      </view>

      <!-- 拆除面积 -->
      <view class="form-item">
        <text class="form-label">拆除面积</text>
        <view class="form-value form-value--input">
          <input
            class="form-input"
            type="digit"
            v-model="form.area"
            placeholder="请输入面积"
          />
          <text class="unit">m²</text>
        </view>
      </view>

      <!-- 需求描述 -->
      <view class="form-item form-item--textarea">
        <text class="form-label">需求描述</text>
        <textarea
          class="form-textarea"
          v-model="form.description"
          placeholder="请详细描述拆除需求，如拆除物类型、特殊要求等"
          maxlength="500"
          :auto-height="true"
        />
        <text class="char-count">{{ (form.description || '').length }}/500</text>
      </view>

      <!-- 拆除施工图/现场照片 -->
      <view class="form-item form-item--upload">
        <text class="form-label">拆除施工图/现场照片</text>
        <text class="upload-tip">最多上传9张</text>
        <image-upload
          v-model="form.images"
          :fileIds.sync="form.imageIds"
          :maxCount="9"
        />
      </view>

      <!-- 期望施工时间 -->
      <view class="form-item" @click="showTimePicker">
        <text class="form-label">期望施工时间</text>
        <view class="form-value">
          <text :class="['value-text', { placeholder: !form.expectedTime }]">
            {{ form.expectedTime || '请选择期望时间' }}
          </text>
          <text class="arrow" decode>{{ '>' }}</text>
        </view>
      </view>

      <!-- 预算范围 -->
      <view class="form-item" @click="showBudgetPicker">
        <text class="form-label">预算范围</text>
        <view class="form-value">
          <text :class="['value-text', { placeholder: !form.budget }]">
            {{ form.budget || '请选择预算范围' }}
          </text>
          <text class="arrow" decode>{{ '>' }}</text>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section safe-area-bottom">
      <view class="submit-btn" @click="handleSubmit">
        <text class="submit-text">发布需求</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import ImageUpload from '@/components/image-upload/image-upload.vue'
import { DEMO_TYPE_OPTIONS, BUDGET_OPTIONS } from '@/utils/constants'
import { createDemand } from '@/api/demand'
import { showLoading, hideLoading, showSuccess } from '@/utils/util'

// 表单数据 - 拆除类型默认室内拆除(1)
const form = reactive({
  demoType: 1,
  demoTypeName: '室内拆除',
  communityName: '',
  district: '',
  address: '',
  area: '',
  expectedTime: '',
  budget: '',
  description: '',
  images: [],
  imageIds: [],
  contactName: '',
  contactPhone: '',
  lat: null,
  lng: null
})

const demoTypeOptions = DEMO_TYPE_OPTIONS

// 显示拆除类型选择器
function showDemoTypePicker() {
  const labels = demoTypeOptions.map(item => item.label)
  uni.showActionSheet({
    itemList: labels,
    success: (res) => {
      const selected = demoTypeOptions[res.tapIndex]
      form.demoType = selected.value
      form.demoTypeName = selected.label
    }
  })
}

// 小区名称失焦 - 调用地图API
function onCommunityBlur() {
  if (form.communityName) {
    // TODO: 调用地图 API 自动填充地址/区域/经纬度
  }
}

// 区域选择器
function showDistrictPicker() {
  uni.chooseLocation({
    success: (res) => {
      form.address = res.address || ''
      form.district = res.name || ''
      form.lat = res.latitude
      form.lng = res.longitude
    }
  })
}

// 时间选择器
function showTimePicker() {
  uni.showActionSheet({
    itemList: ['尽快', '一周内', '一个月内', '三个月内', '时间待定'],
    success: (res) => {
      const labels = ['尽快', '一周内', '一个月内', '三个月内', '时间待定']
      form.expectedTime = labels[res.tapIndex]
    }
  })
}

// 预算选择器
function showBudgetPicker() {
  const labels = BUDGET_OPTIONS.map(item => item.label)
  uni.showActionSheet({
    itemList: labels,
    success: (res) => {
      form.budget = labels[res.tapIndex]
    }
  })
}

// 提交表单
async function handleSubmit() {
  // 验证必填项
  if (!form.contactName) return uni.showToast({ title: '请输入联系人', icon: 'none' })
  if (!form.contactPhone) return uni.showToast({ title: '请输入联系方式', icon: 'none' })
  if (!/^1\d{10}$/.test(form.contactPhone)) return uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
  if (!form.demoType) return uni.showToast({ title: '请选择拆除类型', icon: 'none' })
  if (form.demoType === 1 && !form.communityName) return uni.showToast({ title: '请输入小区名称', icon: 'none' })
  if (form.demoType !== 1 && !form.district) return uni.showToast({ title: '请选择区域', icon: 'none' })
  if (!form.address) return uni.showToast({ title: '请输入详细地址', icon: 'none' })

  showLoading('发布中...')

  try {
    // 自动生成标题：xxx小区拆除项目 或 xxx拆除项目
    const locationName = form.demoType === 1 ? form.communityName : form.district
    const autoTitle = `${locationName}拆除项目`

    await createDemand({
      demoType: form.demoType,
      title: autoTitle,
      communityName: form.communityName || undefined,
      district: form.district || undefined,
      address: form.address || undefined,
      lng: form.lng,
      lat: form.lat,
      area: form.area ? Number(form.area) : undefined,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      budget: form.budget || undefined,
      expectedTime: form.expectedTime || undefined,
      description: form.description || undefined,
      imageIds: form.imageIds.length > 0 ? form.imageIds : undefined,
    })
    hideLoading()
    showSuccess('发布成功')
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    hideLoading()
    console.error('发布需求失败:', error)
  }
}
// 提交表单</script>

<style lang="scss" scoped>
.publish-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 140rpx;
}

.form-section {
  background-color: $bg-card;
  padding: 0 32rpx;
}

.section-title {
  padding: 24rpx 0 8rpx;
  border-bottom: 1rpx solid $border-color-light;

  &-text {
    font-size: $font-size-sm;
    color: $text-placeholder;
  }
}

.form-item {
  display: flex;
  flex-direction: column;
  padding: 24rpx 0;
  border-bottom: 1rpx solid $border-color-light;

  &:last-child {
    border-bottom: none;
  }

  &--textarea,
  &--upload {
    // textarea 和 upload 样式
  }
}

.form-label {
  font-size: $font-size-base;
  color: $text-title;
  font-weight: bold;
  margin-bottom: 16rpx;

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
  padding: 0;
}

.form-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72rpx;

  &--input {
    gap: 8rpx;
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
  min-height: 160rpx;
  line-height: 1.6;
}

.char-count {
  font-size: $font-size-xs;
  color: $text-placeholder;
  text-align: right;
  margin-top: 8rpx;
}

.upload-tip {
  font-size: $font-size-xs;
  color: $text-placeholder;
  margin-bottom: 16rpx;
}

// 协议
.agreement-section {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  padding: 24rpx 32rpx;
}

.checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid $border-color;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2rpx;
  flex-shrink: 0;

  &.checked {
    background-color: $primary-color;
    border-color: $primary-color;
  }
}

.check-mark {
  font-size: 20rpx;
  color: #FFFFFF;
}

.agreement-text {
  font-size: $font-size-xs;
  color: $text-secondary;
  line-height: 1.6;
}

.link {
  color: $primary-color;
}

// 提交按钮
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
