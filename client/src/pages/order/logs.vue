<template>
  <view class="logs-page">
    <!-- 施工日志时间线 -->
    <scroll-view
      class="log-list"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <template v-if="logGroups.length > 0">
        <view
          v-for="(group, gIndex) in logGroups"
          :key="gIndex"
          class="log-group"
        >
          <!-- 日期分组标题 -->
          <view class="group-date">
            <text class="date-text">{{ group.date }}</text>
          </view>

          <!-- 日志列表 -->
          <view
            v-for="(log, lIndex) in group.logs"
            :key="log.id || lIndex"
            class="log-item"
          >
            <!-- 时间线 -->
            <view class="timeline">
              <view class="timeline-dot" />
              <view v-if="lIndex < group.logs.length - 1" class="timeline-line" />
            </view>

            <!-- 内容 -->
            <view class="log-content">
              <text class="log-time">{{ log.time || '' }}</text>
              <text class="log-text">{{ log.content || '' }}</text>

              <!-- 图片 -->
              <view v-if="log.images && log.images.length > 0" class="log-images">
                <image
                  v-for="(img, imgIdx) in log.images"
                  :key="imgIdx"
                  class="log-image"
                  :src="img"
                  mode="aspectFill"
                  @click="previewImage(img, log.images)"
                />
              </view>

              <!-- 视频 -->
              <view v-if="log.videos && log.videos.length > 0" class="log-videos">
                <view
                  v-for="(video, vIdx) in log.videos"
                  :key="vIdx"
                  class="video-item"
                >
                  <video
                    class="video-player"
                    :src="video"
                    :controls="true"
                    :show-center-play-btn="true"
                  />
                </view>
              </view>
            </view>
          </view>
        </view>

        <loading-more :status="loadStatus" @loadmore="loadMore" />
      </template>

      <empty-state
        v-else-if="!loading"
        icon="empty"
        title="暂无施工日志"
      />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import EmptyState from '@/components/empty-state/empty-state.vue'
import LoadingMore from '@/components/loading-more/loading-more.vue'
import { getConstructionLogs } from '@/api/construction-log'
import { PAGE_DEFAULTS } from '@/utils/constants'
import { formatDate, previewImage as previewImageUtil } from '@/utils/util'

const orderId = ref(null)
const logGroups = ref([])
const loading = ref(false)
const refreshing = ref(false)
const page = ref(PAGE_DEFAULTS.PAGE)
const hasMore = ref(true)
const loadStatus = ref('no-more')

/**
 * 按日期分组日志
 */
function groupByDate(logs) {
  const groups = {}
  logs.forEach(log => {
    const date = log.createTime ? formatDate(log.createTime, 'YYYY-MM-DD') : '未知日期'
    const time = log.createTime ? formatDate(log.createTime, 'HH:mm') : ''
    if (!groups[date]) {
      groups[date] = { date, logs: [] }
    }
    groups[date].logs.push({ ...log, time })
  })
  return Object.values(groups)
}

async function fetchLogs(isRefresh = false) {
  if (loading.value) return

  if (isRefresh) {
    page.value = PAGE_DEFAULTS.PAGE
    hasMore.value = true
  }

  if (!hasMore.value) return

  loading.value = true
  loadStatus.value = 'loading'

  try {
    const res = await getConstructionLogs({
      orderId: orderId.value,
      page: page.value,
      size: PAGE_DEFAULTS.SIZE
    })
    const data = res.data || res
    const list = data.list || data.records || []

    if (isRefresh) {
      logGroups.value = groupByDate(list)
    } else {
      const newGroups = groupByDate(list)
      // 合并分组
      logGroups.value = [...logGroups.value, ...newGroups]
    }

    hasMore.value = list.length >= PAGE_DEFAULTS.SIZE
    loadStatus.value = hasMore.value ? 'loadmore' : 'no-more'
  } catch (error) {
    console.error('获取施工日志失败:', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function onRefresh() {
  refreshing.value = true
  fetchLogs(true)
}

function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value++
  fetchLogs()
}

function previewImage(current, urls) {
  previewImageUtil(current, urls)
}

onLoad((options) => {
  orderId.value = options.orderId
  fetchLogs(true)
})
</script>

<style lang="scss" scoped>
.logs-page {
  min-height: 100vh;
  background-color: $bg-page;
}

.log-list {
  height: calc(100vh - 44px);
  padding: 20rpx 32rpx;
}

.log-group {
  margin-bottom: 20rpx;
}

.group-date {
  padding: 16rpx 0;
}

.date-text {
  font-size: $font-size-base;
  font-weight: bold;
  color: $text-title;
}

.log-item {
  display: flex;
  gap: 20rpx;
}

.timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 22rpx;
  flex-shrink: 0;
}

.timeline-dot {
  width: 22rpx;
  height: 22rpx;
  border-radius: 50%;
  background-color: $primary-color;
  flex-shrink: 0;
}

.timeline-line {
  width: 4rpx;
  flex: 1;
  background-color: $border-color;
  margin: 8rpx 0;
}

.log-content {
  flex: 1;
  padding-bottom: 32rpx;
}

.log-time {
  font-size: $font-size-xs;
  color: $text-placeholder;
  display: block;
  margin-bottom: 8rpx;
}

.log-text {
  font-size: $font-size-base;
  color: $text-main;
  line-height: 1.6;
  display: block;
  margin-bottom: 16rpx;
}

.log-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.log-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: $radius-sm;
}

.log-videos {
  margin-bottom: 16rpx;
}

.video-item {
  margin-bottom: 12rpx;
}

.video-player {
  width: 100%;
  height: 360rpx;
  border-radius: $radius-md;
}
</style>
