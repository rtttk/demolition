<template>
  <view class="case-list-page">
    <!-- 筛选 Tab -->
    <view class="filter-bar">
      <view
        v-for="(type, index) in typeFilters"
        :key="index"
        class="filter-item"
        :class="{ active: currentFilter === index }"
        @click="switchFilter(index)"
      >
        <text class="filter-text">{{ type.label }}</text>
      </view>
    </view>

    <!-- 案例列表 -->
    <scroll-view
      class="case-scroll"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <view v-if="caseList.length > 0" class="case-grid">
        <case-card
          v-for="(item, index) in caseList"
          :key="item.id || index"
          :caseItem="item"
          @click="goDetail(item)"
        />
      </view>

      <empty-state
        v-else-if="!loading"
        icon="empty"
        title="暂无案例"
      />

      <loading-more :status="loadStatus" @loadmore="loadMore" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CaseCard from '@/components/case-card/case-card.vue'
import EmptyState from '@/components/empty-state/empty-state.vue'
import LoadingMore from '@/components/loading-more/loading-more.vue'
import { getCases } from '@/api/case'
import { DEMO_TYPE_OPTIONS, PAGE_DEFAULTS } from '@/utils/constants'

const typeFilters = ref([
  { label: '全部', value: '' },
  ...DEMO_TYPE_OPTIONS
])

const currentFilter = ref(0)
const caseList = ref([])
const loading = ref(false)
const refreshing = ref(false)
const page = ref(PAGE_DEFAULTS.PAGE)
const hasMore = ref(true)
const loadStatus = ref('no-more')

async function fetchCases(isRefresh = false) {
  if (loading.value) return

  if (isRefresh) {
    page.value = PAGE_DEFAULTS.PAGE
    hasMore.value = true
  }

  if (!hasMore.value) return

  loading.value = true
  loadStatus.value = 'loading'

  try {
    const filter = typeFilters.value[currentFilter.value]
    const params = { page: page.value, size: PAGE_DEFAULTS.SIZE }
    if (filter.value) params.demoType = filter.value

    const res = await getCases(params)
    const data = res.data || res
    const list = data.list || data.records || []

    if (isRefresh) {
      caseList.value = list
    } else {
      caseList.value.push(...list)
    }

    hasMore.value = list.length >= PAGE_DEFAULTS.SIZE
    loadStatus.value = hasMore.value ? 'loadmore' : 'no-more'
  } catch (error) {
    console.error('获取案例列表失败:', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function switchFilter(index) {
  currentFilter.value = index
  fetchCases(true)
}

function onRefresh() {
  refreshing.value = true
  fetchCases(true)
}

function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value++
  fetchCases()
}

function goDetail(item) {
  uni.navigateTo({ url: `/pages/case/detail?id=${item.id}` })
}

onMounted(() => {
  fetchCases(true)
})
</script>

<style lang="scss" scoped>
.case-list-page {
  min-height: 100vh;
  background-color: $bg-page;
  display: flex;
  flex-direction: column;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 20rpx 32rpx;
  background-color: $bg-card;
}

.filter-item {
  padding: 8rpx 24rpx;
  background-color: $bg-gray;
  border-radius: $radius-round;

  &.active {
    background-color: $primary-color;

    .filter-text {
      color: #FFFFFF;
    }
  }
}

.filter-text {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.case-scroll {
  flex: 1;
  padding: 20rpx 32rpx;
}

.case-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}
</style>
