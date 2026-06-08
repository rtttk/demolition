<template>
  <view class="review-page">
    <!-- 评分 -->
    <view class="rating-section">
      <text class="section-title">服务评分</text>
      <view class="star-rating">
        <view
          v-for="star in 5"
          :key="star"
          class="star-item"
          @click="setRating(star)"
        >
          <text class="star" :class="{ active: star <= rating }">&#9733;</text>
        </view>
      </view>
      <text class="rating-desc">{{ ratingDesc }}</text>
    </view>

    <!-- 评价标签 -->
    <view class="tags-section">
      <text class="section-title">评价标签</text>
      <view class="tag-list">
        <view
          v-for="(tag, index) in reviewTags"
          :key="index"
          class="tag-item"
          :class="{ active: selectedTags.includes(tag) }"
          @click="toggleTag(tag)"
        >
          <text class="tag-text">{{ tag }}</text>
        </view>
      </view>
    </view>

    <!-- 评价内容 -->
    <view class="content-section">
      <text class="section-title">评价内容</text>
      <textarea
        class="content-textarea"
        v-model="content"
        placeholder="请输入您的评价（选填）"
        maxlength="300"
        :auto-height="true"
      />
      <text class="char-count">{{ content.length }}/300</text>
    </view>

    <!-- 图片上传 -->
    <view class="upload-section">
      <text class="section-title">上传图片（选填）</text>
      <image-upload v-model="images" :maxCount="6" />
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section safe-area-bottom">
      <view class="submit-btn" @click="handleSubmit">
        <text class="submit-text">提交评价</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import ImageUpload from '@/components/image-upload/image-upload.vue'
import { REVIEW_TAGS } from '@/utils/constants'
import { submitReview } from '@/api/review'
import { showLoading, hideLoading, showSuccess } from '@/utils/util'

const orderId = ref(null)
const teamId = ref(null)
const rating = ref(5)
const selectedTags = ref([])
const content = ref('')
const images = ref([])
const reviewTags = REVIEW_TAGS

const ratingDesc = computed(() => {
  const descs = ['', '非常差', '较差', '一般', '满意', '非常满意']
  return descs[rating.value] || ''
})

function setRating(value) {
  rating.value = value
}

function toggleTag(tag) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

async function handleSubmit() {
  if (rating.value === 0) {
    return uni.showToast({ title: '请选择评分', icon: 'none' })
  }

  showLoading('提交中...')
  try {
    await submitReview({
      orderId: orderId.value,
      teamId: teamId.value,
      rating: rating.value,
      tags: selectedTags.value.join(','),
      content: content.value,
      images: images.value
    })
    hideLoading()
    showSuccess('评价成功')
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    hideLoading()
    console.error('提交评价失败:', error)
  }
}

onLoad((options) => {
  orderId.value = options.orderId
  teamId.value = options.teamId
})
</script>

<style lang="scss" scoped>
.review-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 140rpx;
}

.rating-section,
.tags-section,
.content-section,
.upload-section {
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

.star-rating {
  display: flex;
  gap: 24rpx;
  justify-content: center;
  margin-bottom: 16rpx;
}

.star-item {
  padding: 8rpx;
}

.star {
  font-size: 64rpx;
  color: $border-color;
  transition: color 0.2s;

  &.active {
    color: #FFB800;
  }
}

.rating-desc {
  font-size: $font-size-base;
  color: $text-secondary;
  text-align: center;
  display: block;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-item {
  padding: 12rpx 24rpx;
  background-color: $bg-gray;
  border-radius: $radius-round;
  border: 2rpx solid transparent;

  &.active {
    background-color: $primary-light;
    border-color: $primary-color;

    .tag-text {
      color: $primary-color;
    }
  }
}

.tag-text {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.content-textarea {
  font-size: $font-size-base;
  color: $text-main;
  width: 100%;
  min-height: 200rpx;
  line-height: 1.6;
}

.char-count {
  font-size: $font-size-xs;
  color: $text-placeholder;
  text-align: right;
  display: block;
  margin-top: 8rpx;
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
