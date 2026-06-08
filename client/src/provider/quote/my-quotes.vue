<template>
  <view class="my-quotes-page">
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

    <!-- 报价列表 -->
    <scroll-view
      class="quote-list"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <template v-if="quoteList.length > 0">
        <view
          v-for="(item, index) in quoteList"
          :key="item.id || index"
          class="quote-card"
          @click="goDetail(item)"
        >
          <view class="quote-header">
            <text class="demand-title ellipsis">{{ item.demandTitle || '拆除需求' }}</text>
            <status-tag :status="item.status" type="quote" />
          </view>
          <view class="quote-body">
            <view class="info-row">
              <text class="info-label">拆除类型：</text>
              <text class="info-value">{{ item.demoTypeName || '--' }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">报价金额：</text>
              <text class="info-value price">¥{{ item.price || '--' }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">预计工期：</text>
              <text class="info-value">{{ item.estimatedDays || '--' }}天</text>
            </view>
          </view>
          <view class="quote-footer">
            <text class="quote-time">{{ item.createTime || '' }}</text>
          </view>
        </view>
        <loading-more :status="loadStatus" @loadmore="loadMore" />
      </template>

      <empty-state
        v-else-if="!loading"
        icon="empty"
        title="暂无报价"
      />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import StatusTag from '@/components/status-tag/status-tag.vue'
import EmptyState from '@/components/empty-state/empty-state.vue'
import LoadingMore from '@/components/loading-more/loading-more.vue'
import { getMyQuotes } from '@/api/quote'
import { PAGE_DEFAULTS } from '@/utils/constants'

const tabs = ref([
  { label: '全部', value: '' },
  { label: '待审核', value: 0 },
  { label: '已通过', value: 1 },
  { label: '已中标', value: 3 }
])

const currentTab = ref(0)
const quoteList = ref([])
const loading = ref(false)
const refreshing = ref(false)
const page = ref(PAGE_DEFAULTS.PAGE)
const hasMore = ref(true)
const loadStatus = ref('no-more')

async function fetchQuotes(isRefresh = false) {
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
    const params = { page: page.value, size: PAGE_DEFAULTS.SIZE }
    if (tab.value !== '') params.status = tab.value

    const res = await getMyQuotes(params)
    const data = res.data || res
    const list = data.list || data.records || []

    if (isRefresh) {
      quoteList.value = list
    } else {
      quoteList.value.push(...list)
    }

    hasMore.value = list.length >= PAGE_DEFAULTS.SIZE
    loadStatus.value = hasMore.value ? 'loadmore' : 'no-more'
  } catch (error) {
    console.error('获取报价列表失败:', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function switchTab(index) {
  currentTab.value = index
  fetchQuotes(true)
}

function onRefresh() {
  refreshing.value = true
  fetchQuotes(true)
}

function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value++
  fetchQuotes()
}

function goDetail(item) {
  uni.navigateTo({ url: `/pages/demand/detail?id=${item.demandId}` })
}

onShow(() => {
  fetchQuotes(true)
})

onMounted(() => {
  fetchQuotes(true)
})
</script>

<style lang="scss" scoped>
.my-quotes-page {
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

.quote-list {
  flex: 1;
  padding: 20rpx 32rpx;
}

.quote-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
  box-shadow: $shadow-sm;
}

.quote-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.demand-title {
  flex: 1;
  font-size: $font-size-md;
  font-weight: bold;
  color: $text-title;
  margin-right: 16rpx;
}

.quote-body {
  margin-bottom: 16rpx;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.info-label {
  font-size: $font-size-sm;
  color: $text-placeholder;
}

.info-value {
  font-size: $font-size-sm;
  color: $text-main;

  &.price {
    color: $primary-color;
    font-weight: bold;
  }
}

.quote-footer {
  padding-top: 12rpx;
  border-top: 1rpx solid $border-color;
}

.quote-time {
  font-size: $font-size-xs;
  color: $text-placeholder;
}
</style>
