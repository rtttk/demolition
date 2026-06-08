<template>
  <view class="search-page">
    <!-- 搜索框 -->
    <view class="search-header">
      <view class="search-input-wrapper">
        <text class="search-icon">&#128269;</text>
        <input
          class="search-input"
          type="text"
          v-model="keyword"
          placeholder="搜索拆除类型、区域..."
          confirm-type="search"
          focus
          @confirm="doSearch"
        />
        <view v-if="keyword" class="clear-btn" @click="clearKeyword">
          <text class="clear-icon">&times;</text>
        </view>
      </view>
      <text class="cancel-btn" @click="goBack">取消</text>
    </view>

    <!-- 搜索历史 -->
    <view v-if="!keyword && searchHistory.length > 0" class="history-section">
      <view class="section-header">
        <text class="section-title">搜索历史</text>
        <text class="clear-all" @click="clearHistory">清空</text>
      </view>
      <view class="history-tags">
        <view
          v-for="(item, index) in searchHistory"
          :key="index"
          class="history-tag"
          @click="quickSearch(item)"
        >
          <text class="tag-text">{{ item }}</text>
        </view>
      </view>
    </view>

    <!-- 热门搜索 -->
    <view v-if="!keyword" class="hot-section">
      <view class="section-header">
        <text class="section-title">热门搜索</text>
      </view>
      <view class="hot-tags">
        <view
          v-for="(item, index) in hotList"
          :key="index"
          class="hot-tag"
          @click="quickSearch(item)"
        >
          <text class="tag-text">{{ item }}</text>
        </view>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view v-if="keyword && searched" class="result-section">
      <view v-if="resultList.length > 0" class="result-list">
        <demand-card
          v-for="(item, index) in resultList"
          :key="item.id || index"
          :demand="item"
          @click="goDetail(item)"
        />
        <loading-more :status="loadStatus" />
      </view>
      <empty-state
        v-else
        icon="search"
        title="未找到相关结果"
      />
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import DemandCard from '@/components/demand-card/demand-card.vue'
import EmptyState from '@/components/empty-state/empty-state.vue'
import LoadingMore from '@/components/loading-more/loading-more.vue'
import { getDemandHall } from '@/api/demand'
import { PAGE_DEFAULTS } from '@/utils/constants'

const keyword = ref('')
const searched = ref(false)
const searchHistory = ref(['室内拆除', '店面拆除', '围墙拆除'])
const hotList = ref(['室内拆除', '店面拆除', '围墙拆除', '管道拆除', '小型构筑物'])
const resultList = ref([])
const loadStatus = ref('no-more')

function doSearch() {
  if (!keyword.value.trim()) return

  searched.value = true
  // 保存搜索历史
  const kw = keyword.value.trim()
  const idx = searchHistory.value.indexOf(kw)
  if (idx > -1) searchHistory.value.splice(idx, 1)
  searchHistory.value.unshift(kw)
  if (searchHistory.value.length > 10) searchHistory.value.pop()

  // 执行搜索
  searchDemands()
}

async function searchDemands() {
  try {
    const res = await getDemandHall({
      keyword: keyword.value,
      page: 1,
      size: PAGE_DEFAULTS.SIZE
    })
    const data = res.data || res
    resultList.value = data.list || data.records || []
  } catch (error) {
    console.error('搜索失败:', error)
    resultList.value = []
  }
}

function quickSearch(text) {
  keyword.value = text
  doSearch()
}

function clearKeyword() {
  keyword.value = ''
  searched.value = false
  resultList.value = []
}

function clearHistory() {
  searchHistory.value = []
}

function goBack() {
  uni.navigateBack()
}

function goDetail(item) {
  uni.navigateTo({ url: `/pages/demand/detail?id=${item.id}` })
}
</script>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  background-color: $bg-page;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 32rpx;
  background-color: $bg-card;
  position: sticky;
  top: 0;
  z-index: 10;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
  height: 72rpx;
  padding: 0 20rpx;
  background-color: $bg-gray;
  border-radius: $radius-round;
}

.search-icon {
  font-size: 28rpx;
}

.search-input {
  flex: 1;
  font-size: $font-size-base;
  color: $text-main;
}

.clear-btn {
  width: 36rpx;
  height: 36rpx;
  background-color: $text-placeholder;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  .clear-icon {
    font-size: 24rpx;
    color: #FFFFFF;
    line-height: 1;
  }
}

.cancel-btn {
  font-size: $font-size-base;
  color: $text-secondary;
  white-space: nowrap;
}

.history-section,
.hot-section {
  padding: 24rpx 32rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: $font-size-base;
  font-weight: bold;
  color: $text-title;
}

.clear-all {
  font-size: $font-size-sm;
  color: $text-placeholder;
}

.history-tags,
.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.history-tag,
.hot-tag {
  padding: 12rpx 24rpx;
  background-color: $bg-card;
  border-radius: $radius-round;

  .tag-text {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.result-section {
  padding: 20rpx 32rpx;
}

.result-list {
  display: flex;
  flex-direction: column;
}
</style>
