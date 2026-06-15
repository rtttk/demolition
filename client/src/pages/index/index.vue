<template>
  <view class="home-page">
    <!-- 自定义导航栏 - 极简风格 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <text class="nav-title">拆除服务平台</text>
      </view>
    </view>

    <!-- 搜索栏 - 极简圆角 -->
    <view class="search-bar" @click="goSearch">
      <view class="search-input">
        <image class="search-icon" src="/static/icons/search.svg" mode="aspectFit" />
        <text class="search-placeholder">搜索拆除类型、区域...</text>
      </view>
    </view>

    <!-- 轮播图 -->
    <swiper
      class="banner-swiper"
      :indicator-dots="true"
      :autoplay="true"
      :interval="4000"
      :circular="true"
      indicator-color="rgba(255,255,255,0.4)"
      indicator-active-color="#FFFFFF"
    >
      <swiper-item v-for="(banner, index) in bannerList" :key="index">
        <view class="banner-item" :style="{ backgroundColor: banner.bgColor }">
          <text class="banner-title">{{ banner.title }}</text>
          <text class="banner-desc">{{ banner.desc }}</text>
        </view>
      </swiper-item>
    </swiper>

    <!-- 快捷入口 - 极简图标 -->
    <view class="quick-entry">
      <view class="entry-item" @click="goPublish">
        <view class="entry-icon entry-icon--publish">
          <image class="entry-svg" src="/static/icons/publish.svg" mode="aspectFit" />
        </view>
        <text class="entry-label">发布需求</text>
      </view>
      <view class="entry-item" @click="goMyOrders">
        <view class="entry-icon entry-icon--order">
          <image class="entry-svg" src="/static/icons/order.svg" mode="aspectFit" />
        </view>
        <text class="entry-label">我的订单</text>
      </view>
      <view class="entry-item" @click="goCaseList">
        <view class="entry-icon entry-icon--case">
          <image class="entry-svg" src="/static/icons/case.svg" mode="aspectFit" />
        </view>
        <text class="entry-label">案例展示</text>
      </view>
      <view class="entry-item" @click="goCompliance">
        <view class="entry-icon entry-icon--compliance">
          <image class="entry-svg" src="/static/icons/compliance.svg" mode="aspectFit" />
        </view>
        <text class="entry-label">合规知识</text>
      </view>
    </view>

    <!-- 推荐案例 -->
    <section-header title="推荐案例" :showMore="true" @more="goCaseList" />

    <scroll-view class="case-scroll" scroll-x>
      <view class="case-list">
        <case-card
          v-for="(item, index) in recommendCases"
          :key="index"
          :caseItem="item"
          @click="goCaseDetail(item)"
        />
      </view>
    </scroll-view>

    <!-- 优质团队 -->
    <section-header title="优质团队" :showMore="true" @more="goTeamList" />

    <view class="team-list">
      <team-card
        v-for="(team, index) in recommendTeams"
        :key="index"
        :team="team"
        @click="goTeamDetail(team)"
      />
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-bottom" />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getStatusBarHeight } from '@/utils/util'
import { COMPLIANCE_CATEGORIES } from '@/utils/constants'
import SectionHeader from '@/components/section-header/section-header.vue'
import CaseCard from '@/components/case-card/case-card.vue'
import TeamCard from '@/components/team-card/team-card.vue'
import { getRecommendCases } from '@/api/case'
import { getRecommendTeams } from '@/api/team'

const statusBarHeight = ref(getStatusBarHeight())

// 轮播图数据 - 极简配色
const bannerList = ref([
  { title: '专业拆除服务', desc: '快速报价 安全施工', bgColor: '#FF6B35' },
  { title: '合规保障', desc: '全程合规 安心无忧', bgColor: '#10B981' },
  { title: '优质团队', desc: '严格筛选 品质保证', bgColor: '#3B82F6' }
])

// 合规分类
const complianceCategories = ref(COMPLIANCE_CATEGORIES)

// 推荐案例
const recommendCases = ref([
  { id: 1, title: '某小区室内拆除工程', coverImage: '', demoTypeName: '室内拆除', area: 120, teamName: '专业拆除队A' },
  { id: 2, title: '商业街店面拆除', coverImage: '', demoTypeName: '店面拆除', area: 200, teamName: '极速拆除队' },
  { id: 3, title: '围墙拆除工程', coverImage: '', demoTypeName: '围墙拆除', area: 50, teamName: '安全拆除组' }
])

// 推荐团队
const recommendTeams = ref([])

/**
 * 加载推荐数据
 */
async function loadData() {
  try {
    const [casesRes, teamsRes] = await Promise.allSettled([
      getRecommendCases({ page: 1, pageSize: 5 }),
      getRecommendTeams({ page: 1, pageSize: 5 })
    ])
    if (casesRes.status === 'fulfilled' && casesRes.value?.data) {
      const list = casesRes.value.data.list || casesRes.value.data || []
      recommendCases.value = list.map(item => {
        const afterImages = item.afterImageUrls || []
        return {
          ...item,
          coverImage: afterImages[0] || item.coverImage || item.images?.[0] || null,
          images: [...(item.afterImageUrls || []), ...(item.beforeImageUrls || [])],
          teamName: item.team?.name || item.teamName || '专业团队'
        }
      })
    }
    if (teamsRes.status === 'fulfilled' && teamsRes.value?.data) {
      // 字段映射：后端 -> 前端
      recommendTeams.value = (teamsRes.value.data.list || teamsRes.value.data || []).map((t) => ({
        id: t.id,
        name: t.name,
        avatar: t.avatar || '',
        specialty: Array.isArray(t.specialties) ? t.specialties[0] : (t.specialties || '专业拆除'),
        experience: t.completedCount || 0,
        rating: t.avgRating || 0,
        reviewCount: t.reviewCount || 0,
        orderCount: t.completedCount || 0,
        completionRate: '100%',
        onTimeRate: '100%',
      }))
    }
  } catch (error) {
    console.error('加载推荐数据失败:', error)
  }
}

// 页面显示时刷新
onShow(() => {
  loadData()
})

onMounted(() => {
  loadData()
})

// 导航方法
function goSearch() {
  uni.navigateTo({ url: '/pages/search/index' })
}

function goPublish() {
  uni.navigateTo({ url: '/pages/demand/publish' })
}

function goMyOrders() {
  uni.switchTab({ url: '/pages/order/index' })
}

function goCaseList() {
  uni.navigateTo({ url: '/pages/case/list' })
}

function goCaseDetail(item) {
  uni.navigateTo({ url: `/pages/case/detail?id=${item.id}` })
}

function goCompliance() {
  uni.navigateTo({ url: '/pages/compliance/list' })
}

function goComplianceDetail(cat) {
  uni.navigateTo({ url: `/pages/compliance/list?category=${cat}` })
}

function goTeamList() {
  // 跳转到团队列表
}

function goTeamDetail(team) {
  uni.navigateTo({ url: `/pages/team/home?id=${team.id}` })
}
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background-color: $bg-page;
}

// 自定义导航栏 - 极简纯色
.nav-bar {
  background-color: $primary-color;
  padding-left: $spacing-8;
  padding-right: $spacing-8;
  padding-bottom: 20rpx;
}

.nav-content {
  height: 88rpx;
  display: flex;
  align-items: center;
}

.nav-title {
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: #FFFFFF;
}

// 搜索栏 - 极简圆角
.search-bar {
  padding: $spacing-4 $spacing-8;
  background-color: $bg-card;
}

.search-input {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  height: 72rpx;
  padding: 0 $spacing-6;
  background-color: $bg-gray;
  border-radius: $radius-full;
}

.search-icon {
  width: 36rpx;
  height: 36rpx;
  opacity: 0.5;
}

.search-placeholder {
  font-size: $font-size-sm;
  color: $text-placeholder;
}

// 轮播图 - 极简设计
.banner-swiper {
  height: 280rpx;
  margin: 0 $spacing-8;
  border-radius: $radius-lg;
  overflow: hidden;
}

.banner-item {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-10;
}

.banner-title {
  font-size: $font-size-xxl;
  font-weight: $font-weight-semibold;
  color: #FFFFFF;
  margin-bottom: $spacing-2;
}

.banner-desc {
  font-size: $font-size-base;
  color: rgba(255, 255, 255, 0.85);
}

// 快捷入口 - 极简图标
.quick-entry {
  display: flex;
  justify-content: space-around;
  padding: $spacing-8;
  background-color: $bg-card;
  margin: $spacing-5 $spacing-8;
  border-radius: $radius-lg;
}

.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-3;
  cursor: pointer;
  transition: opacity $transition-fast;
  
  &:active {
    opacity: 0.7;
  }
}

.entry-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform $transition-fast;

  &--publish {
    background-color: rgba(255, 107, 53, 0.1);
    
    .entry-svg {
      color: $primary-color;
    }
  }
  
  &--order {
    background-color: rgba(16, 185, 129, 0.1);
    
    .entry-svg {
      color: $success-color;
    }
  }
  
  &--case {
    background-color: rgba(59, 130, 246, 0.1);
    
    .entry-svg {
      color: $info-color;
    }
  }
  
  &--compliance {
    background-color: rgba(245, 158, 11, 0.1);
    
    .entry-svg {
      color: $warning-color;
    }
  }
}

.entry-svg {
  width: 44rpx;
  height: 44rpx;
}

.entry-label {
  font-size: $font-size-xs;
  color: $text-secondary;
}

// 推荐案例横向滚动
.case-scroll {
  white-space: nowrap;
  padding: 0 0 $spacing-5;
}

.case-list {
  display: inline-flex;
  gap: $spacing-5;
  padding: 0 $spacing-8;
}

// 团队列表
.team-list {
  padding: 0 $spacing-8;
}

// 底部安全区域
.safe-bottom {
  height: 120rpx;
}
</style>
