<template>
  <view class="order-page">
    <!-- 顶部 Tab 切换 -->
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

    <!-- 订单列表 -->
    <scroll-view
      class="order-list"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <template v-if="orderList.length > 0">
        <order-card
          v-for="(order, index) in orderList"
          :key="order.id || index"
          :order="order"
          @click="goDetail(order)"
          @action="onAction(order)"
        />
        <loading-more :status="loadStatus" @loadmore="loadMore" />
      </template>

      <empty-state
        v-else-if="!loading"
        icon="order"
        title="暂无订单"
        actionText="去发布需求"
        @action="goPublish"
      />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import OrderCard from '@/components/order-card/order-card.vue'
import EmptyState from '@/components/empty-state/empty-state.vue'
import LoadingMore from '@/components/loading-more/loading-more.vue'
import { getMyOrders } from '@/api/order'
import { PAGE_DEFAULTS } from '@/utils/constants'

// Tab 配置
const tabs = ref([
  { label: '全部', value: '' },
  { label: '待确认', value: 0 },
  { label: '进行中', value: 2 },
  { label: '已完成', value: 4 }
])

const currentTab = ref(0)
const orderList = ref([])
const loading = ref(false)
const refreshing = ref(false)
const page = ref(PAGE_DEFAULTS.PAGE)
const hasMore = ref(true)
const loadStatus = ref('no-more')

/**
 * 加载订单列表
 */
async function fetchOrders(isRefresh = false) {
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
    if (tab.value !== '') {
      params.status = tab.value
    }

    const res = await getMyOrders(params)
    const data = res.data || res
    const list = data.list || data.records || []

    if (isRefresh) {
      orderList.value = list
    } else {
      orderList.value.push(...list)
    }

    hasMore.value = list.length >= PAGE_DEFAULTS.SIZE
    loadStatus.value = hasMore.value ? 'loadmore' : 'no-more'
  } catch (error) {
    console.error('获取订单列表失败:', error)
    loadStatus.value = 'loadmore'
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

/**
 * 切换 Tab
 */
function switchTab(index) {
  currentTab.value = index
  fetchOrders(true)
}

/**
 * 下拉刷新
 */
function onRefresh() {
  refreshing.value = true
  fetchOrders(true)
}

/**
 * 加载更多
 */
function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value++
  fetchOrders()
}

/**
 * 跳转订单详情
 */
function goDetail(order) {
  uni.navigateTo({ url: `/pages/order/detail?id=${order.id}` })
}

/**
 * 操作按钮
 */
function onAction(order) {
  if (order.status === 3) {
    uni.navigateTo({ url: `/pages/order/detail?id=${order.id}` })
  } else {
    goDetail(order)
  }
}

/**
 * 跳转发布需求
 */
function goPublish() {
  uni.navigateTo({ url: '/pages/demand/publish' })
}

onShow(() => {
  fetchOrders(true)
})

onMounted(() => {
  fetchOrders(true)
})
</script>

<style lang="scss" scoped>
.order-page {
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

.order-list {
  flex: 1;
  padding: 20rpx 32rpx;
}
</style>
