<template>
  <view class="hall-page">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <text class="nav-title">需求大厅</text>
        <view class="nav-right" @click="goSearch">
          <text class="search-icon">&#128269;</text>
        </view>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view 
        class="filter-item" 
        :class="{ active: currentType !== '' }"
        @click="showTypeFilter"
      >
        <text class="filter-text">{{ currentTypeLabel }}</text>
        <text class="filter-arrow">▼</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: currentDistrict !== '' }"
        @click="showDistrictFilter"
      >
        <text class="filter-text">{{ currentDistrictLabel }}</text>
        <text class="filter-arrow">▼</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: currentSort !== 'newest' }"
        @click="showSortFilter"
      >
        <text class="filter-text">{{ currentSortLabel }}</text>
        <text class="filter-arrow">▼</text>
      </view>
    </view>

    <!-- 需求列表 -->
    <scroll-view
      class="demand-list"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <template v-if="demandList.length > 0">
        <demand-card
          v-for="(item, index) in demandList"
          :key="item.id || index"
          :demand="item"
          @click="goDetail(item)"
        />
        <loading-more :status="loadStatus" @loadmore="loadMore" />
      </template>

      <empty-state
        v-else-if="!loading"
        icon="empty"
        title="暂无需求"
      />
    </scroll-view>

    <!-- 底部导航（服务方自定义 tabBar） -->
    <view class="provider-tabbar safe-area-bottom">
      <view class="tab-item" @click="goHall">
        <text class="tab-icon">&#127968;</text>
        <text class="tab-label active">大厅</text>
      </view>
      <view class="tab-item" @click="goMyQuotes">
        <text class="tab-icon">&#128221;</text>
        <text class="tab-label">报价</text>
      </view>
      <view class="tab-item" @click="goMyOrders">
        <text class="tab-icon">&#128196;</text>
        <text class="tab-label">订单</text>
      </view>
      <view class="tab-item" @click="goProfile">
        <text class="tab-icon">&#128100;</text>
        <text class="tab-label">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import DemandCard from '@/components/demand-card/demand-card.vue'
import EmptyState from '@/components/empty-state/empty-state.vue'
import LoadingMore from '@/components/loading-more/loading-more.vue'
import { getDemandHall } from '@/api/demand'
import { DEMO_TYPE_OPTIONS, PAGE_DEFAULTS } from '@/utils/constants'
import { getStatusBarHeight } from '@/utils/util'

const statusBarHeight = ref(getStatusBarHeight())
const demandList = ref([])
const loading = ref(false)
const refreshing = ref(false)
const page = ref(PAGE_DEFAULTS.PAGE)
const hasMore = ref(true)
const loadStatus = ref('no-more')

// 筛选条件
const currentType = ref('')
const currentDistrict = ref('')
const currentSort = ref('newest')

const currentTypeLabel = computed(() => {
  if (!currentType.value) return '拆除类型'
  const found = DEMO_TYPE_OPTIONS.find(t => t.value === Number(currentType.value))
  return found ? found.label : '拆除类型'
})

const currentDistrictLabel = computed(() => currentDistrict.value || '区域')
const currentSortLabel = computed(() => {
  const map = { newest: '最新', price_asc: '价格低到高', price_desc: '价格高到低' }
  return map[currentSort.value] || '排序'
})

async function fetchDemands(isRefresh = false) {
  if (loading.value) return

  if (isRefresh) {
    page.value = PAGE_DEFAULTS.PAGE
    hasMore.value = true
  }

  if (!hasMore.value) return

  loading.value = true
  loadStatus.value = 'loading'

  try {
    const params = { page: page.value, size: PAGE_DEFAULTS.SIZE }
    if (currentType.value) params.demoType = Number(currentType.value)
    if (currentDistrict.value) params.district = currentDistrict.value
    if (currentSort.value) params.sort = currentSort.value

    const res = await getDemandHall(params)
    const data = res.data || res
    const list = data.list || data.records || []

    if (isRefresh) {
      demandList.value = list
    } else {
      demandList.value.push(...list)
    }

    hasMore.value = list.length >= PAGE_DEFAULTS.SIZE
    loadStatus.value = hasMore.value ? 'loadmore' : 'no-more'
  } catch (error) {
    console.error('获取需求大厅失败:', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function showTypeFilter() {
  const labels = DEMO_TYPE_OPTIONS.map(t => t.label)
  uni.showActionSheet({
    itemList: ['全部', ...labels],
    success: (res) => {
      if (res.tapIndex === 0) {
        currentType.value = ''
      } else {
        currentType.value = DEMO_TYPE_OPTIONS[res.tapIndex - 1].value
      }
      fetchDemands(true)
    }
  })
}

function showDistrictFilter() {
  uni.showActionSheet({
    itemList: ['全部', '黄浦区','徐汇区','长宁区','静安区','普陀区','虹口区','杨浦区','闵行区','宝山区','嘉定区','浦东新区','金山区','松江区','青浦区','奉贤区','崇明区'],
    success: (res) => {
      currentDistrict.value = res.tapIndex === 0 ? '' : ['浦东新区'][res.tapIndex - 1]
      fetchDemands(true)
    }
  })
}

function showSortFilter() {
  uni.showActionSheet({
    itemList: ['最新发布', '价格低到高', '价格高到低'],
    success: (res) => {
      const sorts = ['newest', 'price_asc', 'price_desc']
      currentSort.value = sorts[res.tapIndex]
      fetchDemands(true)
    }
  })
}

function onRefresh() {
  refreshing.value = true
  fetchDemands(true)
}

function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value++
  fetchDemands()
}

function goDetail(item) {
  uni.navigateTo({ url: `/pages/demand/detail?id=${item.id}&from=provider` })
}

function goSearch() {
  uni.navigateTo({ url: '/pages/search/index?from=provider' })
}

function goMyQuotes() {
  uni.navigateTo({ url: '/provider/quote/my-quotes' })
}

function goMyOrders() {
  uni.navigateTo({ url: '/provider/order/my-orders' })
}

function goProfile() {
  uni.navigateTo({ url: '/provider/profile/index' })
}

function goHall() {
  // 当前页面
}

onShow(() => {
  fetchDemands(true)
})

onMounted(() => {
  fetchDemands(true)
})
</script>

<style lang="scss" scoped>
.hall-page {
  min-height: 100vh;
  background-color: $bg-page;
  display: flex;
  flex-direction: column;
  padding-bottom: 120rpx;
}

.nav-bar {
  background-color: $primary-color;
  padding-left: 32rpx;
  padding-right: 32rpx;
  padding-bottom: 20rpx;
}

.nav-content {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-title {
  font-size: $font-size-xl;
  font-weight: bold;
  color: #FFFFFF;
}

.nav-right {
  padding: 8rpx;
}

.search-icon {
  font-size: 36rpx;
  color: #FFFFFF;
}

.filter-bar {
  display: flex;
  gap: $spacing-3;
  padding: $spacing-4 $spacing-8;
  background-color: $bg-card;
  border-bottom: 1rpx solid $border-color-light;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  padding: $spacing-2 $spacing-4;
  background-color: $bg-gray;
  border-radius: $radius-md;
  transition: all $transition-fast;

  &:active {
    opacity: 0.7;
  }

  &.active {
    background-color: rgba($primary-color, 0.1);

    .filter-text {
      color: $primary-color;
    }
  }
}

.filter-text {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.filter-arrow {
  font-size: $font-size-xs;
  color: $text-placeholder;
}

.demand-list {
  flex: 1;
  padding: 20rpx 32rpx;
}

.provider-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100rpx;
  background-color: $bg-card;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.tab-icon {
  font-size: 40rpx;
}

.tab-label {
  font-size: $font-size-xs;
  color: $text-placeholder;

  &.active {
    color: $primary-color;
  }
}
</style>
