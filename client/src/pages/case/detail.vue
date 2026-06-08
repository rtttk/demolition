<template>
  <view class="case-detail-page">
    <!-- 案例图片 -->
    <swiper
      v-if="caseDetail.images && caseDetail.images.length > 0"
      class="image-swiper"
      :indicator-dots="caseDetail.images.length > 1"
      :autoplay="false"
      indicator-color="rgba(0,0,0,0.3)"
      indicator-active-color="#FFFFFF"
    >
      <swiper-item v-for="(img, index) in caseDetail.images" :key="index">
        <image class="swiper-image" :src="img" mode="aspectFill" @click="previewImage(index)" />
      </swiper-item>
    </swiper>

    <!-- 基本信息 -->
    <view class="info-section">
      <text class="case-title">{{ caseDetail.title || '拆除案例' }}</text>
      <view class="case-meta">
        <text class="meta-type">{{ caseDetail.demoTypeName || '室内拆除' }}</text>
        <text v-if="caseDetail.area" class="meta-area">{{ caseDetail.area }}m²</text>
      </view>
    </view>

    <!-- 团队信息 -->
    <view v-if="caseDetail.teamName" class="team-section" @click="goTeam">
      <image class="team-avatar" :src="caseDetail.teamAvatar || '/static/logo.png'" mode="aspectFill" />
      <view class="team-info">
        <text class="team-name">{{ caseDetail.teamName }}</text>
        <text class="team-desc">专业拆除团队</text>
      </view>
      <text class="team-arrow">></text>
    </view>

    <!-- 案例详情 -->
    <view v-if="caseDetail.content" class="content-section">
      <text class="section-title">案例详情</text>
      <rich-text class="rich-content" :nodes="caseDetail.content" />
    </view>

    <view class="safe-bottom" />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCaseDetail } from '@/api/case'
import { showLoading, hideLoading, previewImage as previewImageUtil } from '@/utils/util'

const caseId = ref(null)
const caseDetail = ref({})

async function loadDetail() {
  if (!caseId.value) return

  showLoading()
  try {
    const res = await getCaseDetail(caseId.value)
    caseDetail.value = res.data || res
  } catch (error) {
    console.error('获取案例详情失败:', error)
  } finally {
    hideLoading()
  }
}

function previewImage(index) {
  previewImageUtil(caseDetail.value.images[index], caseDetail.value.images)
}

function goTeam() {
  if (caseDetail.value.teamId) {
    uni.navigateTo({ url: `/pages/team/home?id=${caseDetail.value.teamId}` })
  }
}

onLoad((options) => {
  caseId.value = options.id
  loadDetail()
})
</script>

<style lang="scss" scoped>
.case-detail-page {
  min-height: 100vh;
  background-color: $bg-page;
}

.image-swiper {
  height: 500rpx;
}

.swiper-image {
  width: 100%;
  height: 100%;
}

.info-section {
  background-color: $bg-card;
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
}

.case-title {
  font-size: $font-size-xl;
  font-weight: bold;
  color: $text-title;
  display: block;
  margin-bottom: 16rpx;
}

.case-meta {
  display: flex;
  gap: 20rpx;
}

.meta-type {
  font-size: $font-size-sm;
  color: $primary-color;
  padding: 4rpx 16rpx;
  background-color: $primary-light;
  border-radius: $radius-sm;
}

.meta-area {
  font-size: $font-size-sm;
  color: $text-secondary;
  padding: 4rpx 16rpx;
  background-color: $bg-gray;
  border-radius: $radius-sm;
}

.team-section {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background-color: $bg-card;
  padding: 24rpx 32rpx;
  margin-bottom: 20rpx;
}

.team-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}

.team-info {
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
  color: $text-placeholder;
}

.team-arrow {
  font-size: $font-size-sm;
  color: $text-placeholder;
}

.content-section {
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

.rich-content {
  font-size: $font-size-sm;
  color: $text-main;
  line-height: 1.8;
}

.safe-bottom {
  height: 40rpx;
}
</style>
