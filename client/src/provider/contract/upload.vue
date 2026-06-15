<template>
  <view class="upload-contract-page">
    <!-- 提示信息 -->
    <view class="tips-section">
      <text class="tips-text">请上传双方签署的合同，并填写计划开工日期</text>
    </view>

    <!-- 表单 -->
    <view class="form-section">
      <!-- 合同上传 -->
      <view class="form-item">
        <text class="form-label required">合同文件</text>
        <view class="file-upload" @click="chooseFile">
          <view v-if="!form.contractUrl" class="upload-placeholder">
            <text class="upload-icon">+</text>
            <text class="upload-text">点击上传合同</text>
          </view>
          <view v-else class="file-preview">
            <text class="file-name">{{ form.fileName || '合同文件' }}</text>
            <view class="file-delete" @click.stop="removeFile">
              <text class="delete-icon">&times;</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 计划开工日期 -->
      <view class="form-item">
        <text class="form-label required">计划开工日期</text>
        <picker mode="date" :value="form.planStartDate" @change="onDateChange">
          <view class="date-picker">
            <text class="date-text">{{ form.planStartDate || '请选择日期' }}</text>
            <text class="date-arrow" decode>{{ '>' }}</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section safe-area-bottom">
      <view class="submit-btn" @click="handleSubmit">
        <text class="submit-text">提交合同</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { uploadContract } from '@/api/order'
import { uploadSingleFile } from '@/api/file'
import { showLoading, hideLoading, showSuccess, showToast } from '@/utils/util'

const orderId = ref(null)
const form = reactive({
  contractId: null,
  contractUrl: '',
  fileName: '',
  planStartDate: ''
})

function onDateChange(e) {
  form.planStartDate = e.detail.value
}

function removeFile() {
  form.contractId = null
  form.contractUrl = ''
  form.fileName = ''
}

function chooseFile() {
  // #ifdef MP-WEIXIN
  uni.chooseMessageFile({
    count: 1,
    type: 'file',
    success: async (res) => {
      const tempFile = res.tempFiles[0]
      showLoading('上传中...')
      try {
        const uploadRes = await uploadSingleFile(tempFile.path || tempFile.url)
        form.contractId = uploadRes.data?.id || uploadRes.id
        form.contractUrl = uploadRes.data?.url || uploadRes.url || tempFile.path
        form.fileName = tempFile.name || '合同文件'
        hideLoading()
      } catch (error) {
        hideLoading()
        showToast('上传失败')
      }
    }
  })
  // #endif

  // #ifndef MP-WEIXIN
  uni.chooseFile({
    count: 1,
    type: 'file',
    success: async (res) => {
      const tempFile = res.tempFiles[0]
      showLoading('上传中...')
      try {
        const uploadRes = await uploadSingleFile(tempFile.path || tempFile.url)
        form.contractId = uploadRes.data?.id || uploadRes.id
        form.contractUrl = uploadRes.data?.url || uploadRes.url || tempFile.path
        form.fileName = tempFile.name || '合同文件'
        hideLoading()
      } catch (error) {
        hideLoading()
        showToast('上传失败')
      }
    }
  })
  // #endif
}

async function handleSubmit() {
  if (!form.contractId) {
    return showToast('请上传合同文件')
  }
  if (!form.planStartDate) {
    return showToast('请选择计划开工日期')
  }

  showLoading('提交中...')
  try {
    await uploadContract(orderId.value, {
      contractId: form.contractId,
      planStartDate: form.planStartDate
    })
    hideLoading()
    showSuccess('提交成功')
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    hideLoading()
    console.error('提交合同失败:', error)
  }
}

onLoad((options) => {
  orderId.value = options.orderId
})
</script>

<style lang="scss" scoped>
.upload-contract-page {
  min-height: 100vh;
  background-color: $bg-page;
}

.tips-section {
  padding: 24rpx 32rpx;
  background-color: #FFF7E6;
}

.tips-text {
  font-size: $font-size-sm;
  color: #B8860B;
}

.form-section {
  background-color: $bg-card;
  padding: 28rpx 32rpx;
}

.form-item {
  margin-bottom: 32rpx;

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

.file-upload {
  border: 2rpx dashed $border-color;
  border-radius: $radius-md;
  background-color: $bg-gray;
  min-height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
}

.upload-icon {
  font-size: 64rpx;
  color: $text-placeholder;
  line-height: 1;
  margin-bottom: 12rpx;
}

.upload-text {
  font-size: $font-size-sm;
  color: $text-placeholder;
}

.file-preview {
  display: flex;
  align-items: center;
  padding: 32rpx;
  width: 100%;
}

.file-name {
  flex: 1;
  font-size: $font-size-base;
  color: $text-main;
  word-break: break-all;
}

.file-delete {
  width: 48rpx;
  height: 48rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16rpx;
  flex-shrink: 0;
}

.delete-icon {
  font-size: 32rpx;
  color: #FFFFFF;
  line-height: 1;
}

.date-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background-color: $bg-gray;
  border-radius: $radius-md;
}

.date-text {
  font-size: $font-size-base;
  color: $text-main;
}

.date-arrow {
  font-size: $font-size-base;
  color: $text-placeholder;
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
