<template>
  <view class="compliance-page">
    <!-- 分类 Tab -->
    <view class="tab-bar">
      <view
        v-for="(cat, index) in categories"
        :key="index"
        class="tab-item"
        :class="{ active: currentTab === index }"
        @click="switchTab(index)"
      >
        <text class="tab-text">{{ cat }}</text>
        <view v-if="currentTab === index" class="tab-line" />
      </view>
    </view>

    <!-- 文档列表 -->
    <scroll-view
      class="doc-list"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <view v-if="docList.length > 0" class="list-content">
        <view
          v-for="(doc, index) in docList"
          :key="doc.id || index"
          class="doc-item"
          @click="goDetail(doc)"
        >
          <view class="doc-icon">
            <text class="icon-text">&#128196;</text>
          </view>
          <view class="doc-info">
            <text class="doc-title ellipsis">{{ doc.title || '合规文档' }}</text>
            <text class="doc-desc ellipsis">{{ doc.summary || '' }}</text>
            <text class="doc-time">{{ doc.createTime || '' }}</text>
          </view>
          <text class="doc-arrow" decode>{{ '>' }}</text>
        </view>
      </view>

      <empty-state
        v-else-if="!loading"
        icon="empty"
        title="暂无文档"
      />

      <loading-more :status="loadStatus" @loadmore="loadMore" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import EmptyState from '@/components/empty-state/empty-state.vue'
import LoadingMore from '@/components/loading-more/loading-more.vue'
import { getComplianceDocs } from '@/api/compliance'
import { COMPLIANCE_CATEGORIES, PAGE_DEFAULTS } from '@/utils/constants'

const categories = ref(COMPLIANCE_CATEGORIES)
const currentTab = ref(0)
const docList = ref([])
const loading = ref(false)
const refreshing = ref(false)
const page = ref(PAGE_DEFAULTS.PAGE)
const hasMore = ref(true)
const loadStatus = ref('no-more')

async function fetchDocs(isRefresh = false) {
  if (loading.value) return

  if (isRefresh) {
    page.value = PAGE_DEFAULTS.PAGE
    hasMore.value = true
  }

  if (!hasMore.value) return

  loading.value = true
  loadStatus.value = 'loading'

  try {
    const res = await getComplianceDocs({
      category: categories.value[currentTab.value],
      page: page.value,
      size: PAGE_DEFAULTS.SIZE
    })
    const data = res.data || res
    const list = data.list || data.records || []

    if (isRefresh) {
      docList.value = list
    } else {
      docList.value.push(...list)
    }

    hasMore.value = list.length >= PAGE_DEFAULTS.SIZE
    loadStatus.value = hasMore.value ? 'loadmore' : 'no-more'
  } catch (error) {
    console.error('获取合规文档失败:', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function switchTab(index) {
  currentTab.value = index
  fetchDocs(true)
}

function onRefresh() {
  refreshing.value = true
  fetchDocs(true)
}

function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value++
  fetchDocs()
}

function goDetail(doc) {
  // 跳转到文档详情
}

onLoad((options) => {
  if (options.category) {
    const idx = categories.value.indexOf(options.category)
    if (idx > -1) currentTab.value = idx
  }
  fetchDocs(true)
})
</script>

<style lang="scss" scoped>
.compliance-page {
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

.doc-list {
  flex: 1;
  padding: 20rpx 32rpx;
}

.list-content {
  display: flex;
  flex-direction: column;
}

.doc-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background-color: $bg-card;
  padding: 24rpx;
  border-radius: $radius-lg;
  margin-bottom: 16rpx;
}

.doc-icon {
  width: 80rpx;
  height: 80rpx;
  background-color: $primary-light;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .icon-text {
    font-size: 40rpx;
  }
}

.doc-info {
  flex: 1;
  min-width: 0;
}

.doc-title {
  font-size: $font-size-base;
  font-weight: bold;
  color: $text-title;
  display: block;
  margin-bottom: 8rpx;
}

.doc-desc {
  font-size: $font-size-xs;
  color: $text-secondary;
  display: block;
  margin-bottom: 4rpx;
}

.doc-time {
  font-size: $font-size-xs;
  color: $text-placeholder;
}

.doc-arrow {
  font-size: $font-size-sm;
  color: $text-placeholder;
  flex-shrink: 0;
}
</style>
