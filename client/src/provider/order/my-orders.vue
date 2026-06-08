<template>
  <view class="my-orders-page">
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
        <view
          v-for="(order, index) in orderList"
          :key="order.id || index"
          class="order-card"
          @click="goDetail(order)"
        >
          <view class="card-header">
            <text class="order-no">{{ order.orderNo || '--' }}</text>
            <status-tag :status="order.status" type="order" />
          </view>
          <view class="card-body">
            <text class="demand-title ellipsis">{{ order.demandTitle || '拆除订单' }}</text>
            <view class="order-info">
              <text class="info-text">{{ order.demoTypeName || '--' }}</text>
              <text class="info-text">{{ order.area ? order.area + 'm²' : '--' }}</text>
              <text class="info-text price">¥{{ order.amount || '--' }}</text>
            </view>
          </view>
          <view class="card-footer">
            <text class="create-time">{{ order.createTime || '' }}</text>
            <view v-if="order.status === 1" class="action-btn" @click.stop="acceptOrder(order)">
              <text class="action-text">接受订单</text>
            </view>
          </view>
        </view>
        <loading-more :status="loadStatus" @loadmore="loadMore" />
      </template>

      <empty-state
        v-else-if="!loading"
        icon="order"
        title="暂无订单"
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
import { getMyOrders, acceptOrder as acceptOrderApi } from '@/api/order'
import { PAGE_DEFAULTS } from '@/utils/constants'
import { showLoading, hideLoading, showSuccess, showConfirm } from '@/utils/util'

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
    const params = { page: page.value, size: PAGE_DEFAULTS.SIZE }
    if (tab.value !== '') params.status = tab.value

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
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function switchTab(index) {
  currentTab.value = index
  fetchOrders(true)
}

function onRefresh() {
  refreshing.value = true
  fetchOrders(true)
}

function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value++
  fetchOrders()
}

function goDetail(order) {
  uni.navigateTo({ url: `/provider/order/detail?id=${order.id}` })
}

async function acceptOrder(order) {
  const confirmed = await showConfirm('确认接受此订单?')
  if (!confirmed) return

  showLoading('提交中...')
  try {
    await acceptOrderApi(order.id)
    hideLoading()
    showSuccess('已接受订单')
    fetchOrders(true)
  } catch (error) {
    hideLoading()
  }
}

onShow(() => {
  fetchOrders(true)
})

onMounted(() => {
  fetchOrders(true)
})
</script>

<style lang="scss" scoped>
.my-orders-page {
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

.order-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
  box-shadow: $shadow-sm;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.order-no {
  font-size: $font-size-sm;
  color: $text-placeholder;
}

.card-body {
  margin-bottom: 16rpx;
}

.demand-title {
  font-size: $font-size-md;
  font-weight: bold;
  color: $text-title;
  display: block;
  margin-bottom: 12rpx;
}

.order-info {
  display: flex;
  gap: 24rpx;
}

.info-text {
  font-size: $font-size-sm;
  color: $text-secondary;

  &.price {
    color: $primary-color;
    font-weight: bold;
  }
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16rpx;
  border-top: 1rpx solid $border-color;
}

.create-time {
  font-size: $font-size-xs;
  color: $text-placeholder;
}

.action-btn {
  padding: 8rpx 32rpx;
  background-color: $primary-color;
  border-radius: $radius-round;

  .action-text {
    font-size: $font-size-sm;
    color: #FFFFFF;
  }
}
</style>
