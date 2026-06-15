<template>
  <view class="case-detail-page">
    <!-- 案例图片 -->
    <swiper
      v-if="allImages.length > 0"
      class="image-swiper"
      :indicator-dots="allImages.length > 1"
      :autoplay="false"
      indicator-color="rgba(0,0,0,0.3)"
      indicator-active-color="#FFFFFF"
    >
      <swiper-item v-for="(img, index) in allImages" :key="index">
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
    <view v-if="caseDetail.team?.name" class="team-section" @click="goTeam">
      <view class="team-info">
        <text class="team-name">{{ caseDetail.team.name }}</text>
        <text class="team-desc">施工团队</text>
      </view>
      <text class="team-arrow" decode>{{ '>' }}</text>
    </view>

    <!-- 公司信息 -->
    <view v-if="caseDetail.company?.name" class="company-section">
      <view class="info-row">
        <text class="info-label">所属公司</text>
        <text class="info-value">{{ caseDetail.company.name }}</text>
      </view>
    </view>

    <!-- 其他信息 -->
    <view class="detail-section" v-if="caseDetail.address || caseDetail.duration">
      <view class="info-row" v-if="caseDetail.address">
        <text class="info-label">地址</text>
        <text class="info-value">{{ caseDetail.address }}</text>
      </view>
      <view class="info-row" v-if="caseDetail.duration">
        <text class="info-label">工期</text>
        <text class="info-value">{{ caseDetail.duration }} 天</text>
      </view>
    </view>

    <!-- 案例描述 -->
    <view v-if="caseDetail.description" class="content-section">
      <text class="section-title">案例描述</text>
      <text class="description-text">{{ caseDetail.description }}</text>
    </view>

    <!-- 施工前后对比 -->
    <view v-if="caseDetail.beforeImageUrls?.length" class="comparison-section">
      <text class="section-title">施工前</text>
      <view class="image-grid">
        <image
          v-for="(url, index) in caseDetail.beforeImageUrls"
          :key="'before-' + index"
          class="grid-image"
          :src="url"
          mode="aspectFill"
          @click="previewBeforeImage(index)"
        />
      </view>
    </view>

    <view v-if="caseDetail.afterImageUrls?.length" class="comparison-section">
      <text class="section-title">施工后</text>
      <view class="image-grid">
        <image
          v-for="(url, index) in caseDetail.afterImageUrls"
          :key="'after-' + index"
          class="grid-image"
          :src="url"
          mode="aspectFill"
          @click="previewAfterImage(index)"
        />
      </view>
    </view>

    <view class="safe-bottom" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCaseDetail } from '@/api/case'
import { showLoading, hideLoading, previewImage as previewImageUtil } from '@/utils/util'

const caseId = ref(null)
const caseDetail = ref({})

const allImages = computed(() => {
  const before = caseDetail.value.beforeImageUrls || []
  const after = caseDetail.value.afterImageUrls || []
  return [...before, ...after]
})

async function loadDetail() {
  if (!caseId.value) return

  showLoading()
  try {
    const res = await getCaseDetail(caseId.value)
    const data = res.data || res
    // 兼容旧数据格式
    caseDetail.value = {
      ...data,
      beforeImageUrls: data.beforeImageUrls || data.images || [],
      afterImageUrls: data.afterImageUrls || []
    }
  } catch (error) {
    console.error('获取案例详情失败:', error)
  } finally {
    hideLoading()
  }
}

function previewImage(index) {
  previewImageUtil(allImages.value[index], allImages.value)
}

function previewBeforeImage(index) {
  const urls = caseDetail.value.beforeImageUrls || []
  previewImageUtil(urls[index], urls)
}

function previewAfterImage(index) {
  const urls = caseDetail.value.afterImageUrls || []
  previewImageUtil(urls[index], urls)
}

function goTeam() {
  if (caseDetail.value.team?.id) {
    uni.navigateTo({ url: `/pages/team/home?id=${caseDetail.value.team.id}` })
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
  width: 100%;
  height: 500rpx;
}

.swiper-image {
  width: 100%;
  height: 100%;
}

.info-section {
  padding: 32rpx;
  background-color: $bg-card;
}

.case-title {
  font-size: $font-size-xl;
  font-weight: bold;
  color: $text-title;
  line-height: 1.4;
  display: block;
  margin-bottom: 16rpx;
}

.case-meta {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.meta-type {
  font-size: $font-size-sm;
  color: #FFFFFF;
  background-color: $primary-color;
  padding: 4rpx 16rpx;
  border-radius: $radius-sm;
}

.meta-area {
  font-size: $font-size-sm;
  color: $primary-color;
  font-weight: bold;
}

.team-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  margin: 20rpx 0;
  background-color: $bg-card;
}

.team-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.team-name {
  font-size: $font-size-md;
  font-weight: bold;
  color: $text-title;
}

.team-desc {
  font-size: $font-size-xs;
  color: $text-placeholder;
}

.team-arrow {
  font-size: $font-size-lg;
  color: $text-placeholder;
}

.company-section,
.detail-section {
  padding: 24rpx 32rpx;
  margin: 20rpx 0;
  background-color: $bg-card;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
}

.info-label {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.info-value {
  font-size: $font-size-sm;
  color: $text-title;
}

.content-section {
  padding: 24rpx 32rpx;
  margin: 20rpx 0;
  background-color: $bg-card;
}

.section-title {
  font-size: $font-size-md;
  font-weight: bold;
  color: $text-title;
  margin-bottom: 16rpx;
  display: block;
}

.description-text {
  font-size: $font-size-sm;
  color: $text-main;
  line-height: 1.6;
}

.comparison-section {
  padding: 24rpx 32rpx;
  margin: 20rpx 0;
  background-color: $bg-card;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.grid-image {
  width: 100%;
  height: 240rpx;
  border-radius: $radius-md;
}
</style>

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
