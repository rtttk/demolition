<template>
  <view class="my-list-page">
    <!-- Tab 筛选 -->
    <view class="tab-bar">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        class="tab-item"
        :class="{ active: currentTab === index }"
        @click="switchTab(index)"
      >
        <text class="tab-text">{{ tab.label }}</text>
        <view v-if="currentTab === index" class="tab-line" />
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
        actionText="发布新需求"
        @action="goPublish"
      />
    </scroll-view>

    <!-- 浮动发布按钮 -->
    <view class="float-btn" @click="goPublish">
      <text class="float-icon">+</text>
      <text class="float-text">发布新需求</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import DemandCard from '@/components/demand-card/demand-card.vue'
import EmptyState from '@/components/empty-state/empty-state.vue'
import LoadingMore from '@/components/loading-more/loading-more.vue'
import { getMyDemands } from '@/api/demand'
import { PAGE_DEFAULTS } from '@/utils/constants'

const tabs = ref([
  { label: '全部', value: '' },
  { label: '待报价', value: '0,1' },
  { label: '进行中', value: '2,3,4,5' },
  { label: '已完成', value: '6' }
])

const currentTab = ref(0)
const demandList = ref([])
const loading = ref(false)
const refreshing = ref(false)
const page = ref(PAGE_DEFAULTS.PAGE)
const hasMore = ref(true)
const loadStatus = ref('no-more')

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
    const tab = tabs.value[currentTab.value]
    const params = {
      page: page.value,
      size: PAGE_DEFAULTS.SIZE
    }
    if (tab.value) {
      params.status = tab.value
    }

    const res = await getMyDemands(params)
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
    console.error('获取需求列表失败:', error)
    loadStatus.value = 'loadmore'
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function switchTab(index) {
  currentTab.value = index
  fetchDemands(true)
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
  uni.navigateTo({ url: `/pages/demand/detail?id=${item.id}` })
}

function goPublish() {
  uni.navigateTo({ url: '/pages/demand/publish' })
}

onShow(() => {
  fetchDemands(true)
})

onMounted(() => {
  fetchDemands(true)
})
</script>

<style lang="scss" scoped>
.my-list-page {
  min-height: 100vh;
  background-color: $bg-page;
  display: flex;
  flex-direction: column;
}

.tab-bar {
  display: flex;
  background-color: $bg-card;
  padding: 0 16rpx;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 0 16rpx;
  position: relative;

  &.active {
    .tab-text {
      color: $primary-color;
      font-weight: bold;
    }
  }
}

.tab-text {
  font-size: $font-size-base;
  color: $text-secondary;
}

.tab-line {
  position: absolute;
  bottom: 0;
  width: 48rpx;
  height: 6rpx;
  background-color: $primary-color;
  border-radius: 3rpx;
}

.demand-list {
  flex: 1;
  padding: 20rpx 32rpx;
}

.float-btn {
  position: fixed;
  right: 32rpx;
  bottom: 120rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx 32rpx;
  background-color: $primary-color;
  border-radius: $radius-round;
  box-shadow: $shadow-lg;
  z-index: 100;

  &:active {
    opacity: 0.85;
  }
}

.float-icon {
  font-size: 36rpx;
  color: #FFFFFF;
  line-height: 1;
}

.float-text {
  font-size: $font-size-sm;
  color: #FFFFFF;
  font-weight: bold;
}
</style>
