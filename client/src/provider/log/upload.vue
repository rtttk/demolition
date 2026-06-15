<template>
  <view class="upload-log-page">
    <!-- 表单 -->
    <view class="form-section">
      <!-- 施工进度 -->
      <view class="form-item">
        <text class="form-label required">施工进度</text>
        <view class="progress-section">
          <slider
            class="progress-slider"
            :value="form.progress"
            :min="0"
            :max="100"
            :step="5"
            activeColor="#07C160"
            backgroundColor="#E5E5E5"
            block-size="20"
            show-value
            @change="onProgressChange"
          />
          <text class="progress-text">{{ form.progress }}%</text>
        </view>
      </view>

      <!-- 日志内容 -->
      <view class="form-item form-item--textarea">
        <text class="form-label required">施工内容</text>
        <textarea
          class="form-textarea"
          v-model="form.content"
          placeholder="请描述今日施工内容、进度等"
          maxlength="500"
          :auto-height="true"
        />
        <text class="char-count">{{ (form.content || '').length }}/500</text>
      </view>

      <!-- 图片上传 -->
      <view class="form-item form-item--upload">
        <text class="form-label">现场照片</text>
        <text class="upload-tip">最多上传9张</text>
        <image-upload v-model="form.images" :maxCount="9" @update:fileIds="form.imageIds = $event" />
      </view>

      <!-- 视频上传 -->
      <view class="form-item">
        <text class="form-label">现场视频</text>
        <view class="video-upload" @click="chooseVideo">
          <text class="upload-icon">+</text>
          <text class="upload-text">添加视频</text>
        </view>
        <view v-if="form.videoUrl" class="video-preview">
          <video class="video-player" :src="form.videoUrl" :controls="true" />
          <view class="video-delete" @click="removeVideo">
            <text class="delete-icon">&times;</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section safe-area-bottom">
      <view class="submit-btn" @click="handleSubmit">
        <text class="submit-text">{{ isUpdate ? '更新日志' : '上传日志' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import ImageUpload from '@/components/image-upload/image-upload.vue'
import { createConstructionLog, checkTodayLog, updateConstructionLog } from '@/api/construction-log'
import { uploadSingleFile } from '@/api/file'
import { showLoading, hideLoading, showSuccess } from '@/utils/util'

const orderId = ref(null)
const isUpdate = ref(false)
const existingLogId = ref(null)
const form = reactive({
  content: '',
  progress: 0,
  images: [],
  imageIds: [],
  videoUrl: '',
  videoId: null
})

async function checkLog() {
  if (!orderId.value) return

  try {
    const res = await checkTodayLog(orderId.value)
    const data = res.data || res
    if (data?.exists) {
      // 今日已上传日志，加载已有数据
      if (data.log) {
        const log = data.log
        form.content = log.content || ''
        form.progress = log.progress || 0
        form.images = log.imageUrls || []
        form.imageIds = log.imageIds || []
        form.videoUrl = log.videoUrl || ''
        form.videoId = log.videoId || null
        existingLogId.value = log.id
      }
      isUpdate.value = true
      uni.showToast({ title: '已加载今日日志，可直接更新', icon: 'none' })
    }
  } catch (error) {
    // 忽略
  }
}

function onProgressChange(e) {
  form.progress = e.detail.value
}

function removeVideo() {
  form.videoUrl = ''
  form.videoId = null
}

function chooseVideo() {
  uni.chooseVideo({
    sourceType: ['album', 'camera'],
    maxDuration: 60,
    compressed: true,
    success: async (res) => {
      showLoading('上传中...')
      try {
        const uploadRes = await uploadSingleFile(res.tempFilePath)
        form.videoUrl = uploadRes.data?.url || uploadRes.url || res.tempFilePath
        form.videoId = uploadRes.data?.id || uploadRes.id || null
        hideLoading()
      } catch (error) {
        hideLoading()
        form.videoUrl = res.tempFilePath
        form.videoId = null
      }
    }
  })
}

async function handleSubmit() {
  if (!form.content) return uni.showToast({ title: '请输入施工内容', icon: 'none' })

  const payload = {
    content: form.content,
    progress: form.progress,
    imageIds: form.imageIds,
    videoIds: form.videoId ? [form.videoId] : []
  }

  showLoading(isUpdate.value ? '更新中...' : '上传中...')
  try {
    if (isUpdate.value && existingLogId.value) {
      await updateConstructionLog(existingLogId.value, payload)
    } else {
      await createConstructionLog({
        orderId: orderId.value,
        ...payload
      })
    }
    hideLoading()
    showSuccess(isUpdate.value ? '更新成功' : '上传成功')
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    hideLoading()
    console.error(isUpdate.value ? '更新日志失败:' : '上传日志失败:', error)
  }
}

onLoad((options) => {
  orderId.value = options.orderId
  checkLog()
})
</script>

<style lang="scss" scoped>
.upload-log-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 140rpx;
}

.form-section {
  background-color: $bg-card;
  padding: 28rpx 32rpx;
}

.form-item {
  margin-bottom: 28rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.progress-slider {
  flex: 1;
}

.progress-text {
  font-size: $font-size-base;
  font-weight: bold;
  color: $primary-color;
  min-width: 80rpx;
  text-align: right;
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

.video-upload {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 160rpx;
  border: 2rpx dashed $border-color;
  border-radius: $radius-md;
  background-color: $bg-gray;
}

.upload-icon {
  font-size: 48rpx;
  color: $text-placeholder;
  line-height: 1;
}

.upload-text {
  font-size: $font-size-sm;
  color: $text-placeholder;
}

.video-preview {
  position: relative;
  margin-top: 16rpx;
  border-radius: $radius-md;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: 360rpx;
}

.video-delete {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 48rpx;
  height: 48rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  font-size: 32rpx;
  color: #FFFFFF;
  line-height: 1;
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
