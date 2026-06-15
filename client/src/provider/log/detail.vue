<template>
  <view class="log-detail-page">
    <view class="page-loading" v-if="loading">
      <text>加载中...</text>
    </view>

    <view class="page-content" v-else-if="logDetail">
      <!-- 进度 -->
      <view class="progress-section">
        <text class="progress-label">施工进度</text>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: logDetail.progress + '%' }"></view>
        </view>
        <text class="progress-value">{{ logDetail.progress }}%</text>
      </view>

      <!-- 内容 -->
      <view class="content-section">
        <text class="content-text">{{ logDetail.content }}</text>
      </view>

      <!-- 图片 -->
      <view class="media-section" v-if="logDetail.imageUrls && logDetail.imageUrls.length > 0">
        <text class="section-title">现场照片</text>
        <view class="image-grid">
          <view
            v-for="(url, index) in logDetail.imageUrls"
            :key="index"
            class="image-item"
            @click="previewImage(index)"
          >
            <image :src="url" mode="aspectFill" class="log-image" />
          </view>
        </view>
      </view>

      <!-- 视频 -->
      <view class="media-section" v-if="logDetail.videoUrls && logDetail.videoUrls.length > 0">
        <text class="section-title">现场视频</text>
        <view class="video-list">
          <video
            v-for="(url, index) in logDetail.videoUrls"
            :key="index"
            :src="url"
            class="log-video"
            controls
          ></video>
        </view>
      </view>

      <!-- 时间信息 -->
      <view class="time-section">
        <view class="time-item">
          <text class="time-label">登记时间</text>
          <text class="time-value">{{ logDetail.logDate || logDetail.createdAt }}</text>
        </view>
        <view class="time-item" v-if="logDetail.updatedAt">
          <text class="time-label">更新时间</text>
          <text class="time-value">{{ logDetail.updatedAt }}</text>
        </view>
      </view>
    </view>

    <view class="page-empty" v-else>
      <text>日志不存在</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getConstructionLogDetail } from '@/api/construction-log'
import { showLoading, hideLoading, showToast } from '@/utils/util'

const logId = ref(null)
const loading = ref(false)
const logDetail = ref(null)

function previewImage(currentIndex) {
  if (!logDetail.value?.imageUrls) return
  uni.previewImage({
    urls: logDetail.value.imageUrls,
    current: currentIndex
  })
}

onLoad(async (options) => {
  if (!options.id) {
    showToast('参数错误')
    return
  }
  logId.value = options.id

  loading.value = true
  try {
    const res = await getConstructionLogDetail(options.id)
    logDetail.value = res.data || res
  } catch (error) {
    showToast('获取日志详情失败')
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.log-detail-page {
  min-height: 100vh;
  background-color: $bg-page;
}

.page-loading,
.page-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300rpx;
  color: $text-placeholder;
  font-size: $font-size-base;
}

.page-content {
  padding: 24rpx 32rpx;
}

.progress-section {
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: 28rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
}

.progress-label {
  font-size: $font-size-base;
  color: $text-title;
  font-weight: bold;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.progress-bar {
  flex: 1;
  height: 16rpx;
  background-color: $bg-gray;
  border-radius: 8rpx;
  overflow: hidden;
  margin-right: 16rpx;
}

.progress-fill {
  height: 100%;
  background-color: $primary-color;
  border-radius: 8rpx;
  transition: width 0.3s;
}

.progress-value {
  font-size: $font-size-base;
  color: $primary-color;
  font-weight: bold;
  width: 80rpx;
  text-align: right;
  flex-shrink: 0;
}

.content-section {
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: 28rpx;
  margin-bottom: 24rpx;
}

.content-text {
  font-size: $font-size-base;
  color: $text-main;
  line-height: 1.6;
  word-break: break-all;
}

.media-section {
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: 28rpx;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: $font-size-base;
  color: $text-title;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.image-item {
  width: 210rpx;
  height: 210rpx;
  border-radius: $radius-sm;
  overflow: hidden;
}

.log-image {
  width: 100%;
  height: 100%;
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.log-video {
  width: 100%;
  height: 400rpx;
  border-radius: $radius-sm;
}

.time-section {
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: 28rpx;
}

.time-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16rpx;

  &:last-child {
    padding-bottom: 0;
  }
}

.time-label {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.time-value {
  font-size: $font-size-sm;
  color: $text-main;
}
</style>
