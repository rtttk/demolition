<template>
  <view class="order-detail-page">
    <!-- 1. 状态头部 -->
    <view class="status-header" :style="{ backgroundColor: statusColor }">
      <view class="status-header-inner">
        <text class="status-label">订单状态</text>
        <view class="status-main">
          <StatusTag :status="order.status" type="order" />
          <text class="status-name">{{ order.statusName || statusText }}</text>
        </view>
      </view>
    </view>

    <!-- 2. 订单信息栏 -->
    <view class="order-info-bar">
      <view class="info-col">
        <text class="info-label">订单编号</text>
        <text class="info-value">{{ order.orderNo || '--' }}</text>
      </view>
      <view class="info-col text-right">
        <text class="info-label">创建时间</text>
        <text class="info-value">{{ order.createTime || '--' }}</text>
      </view>
    </view>

    <!-- 3. 状态进度条 -->
    <view class="progress-section">
      <view class="progress-bar">
        <view
          v-for="(step, index) in progressSteps"
          :key="index"
          class="progress-step"
          :class="{ active: index <= currentStep, current: index === currentStep }"
        >
          <view class="step-dot">
            <text v-if="index < currentStep" class="step-check">&#10003;</text>
          </view>
          <text class="step-label">{{ step.label }}</text>
          <view
            v-if="index < progressSteps.length - 1"
            class="step-line"
            :class="{ active: index < currentStep }"
          />
        </view>
      </view>
    </view>

    <!-- 4. 需求方信息 -->
    <view class="card-section">
      <SectionHeader title="需求方信息" />
      <view class="section-body">
        <view class="info-grid">
          <view class="info-item">
            <text class="info-label">联系人</text>
            <text class="info-value">{{ order.demand?.contactName || '--' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">联系电话</text>
            <text class="info-value">{{ order.demand?.contactPhone || '--' }}</text>
            <view class="call-btn" @click="makeCall">
              <text class="call-text">拨打</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 5. 需求信息 -->
    <view class="card-section">
      <SectionHeader title="需求信息" />
      <view class="section-body">
        <view class="info-grid">
          <view class="info-item">
            <text class="info-label">需求标题</text>
            <text class="info-value">{{ order.demand?.title || '--' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">拆除类型</text>
            <text class="info-value">{{ order.demoTypeName || '--' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">所在区域</text>
            <text class="info-value">{{ order.demand?.district || '--' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">详细地址</text>
            <text class="info-value address-value">{{ order.demand?.address || '--' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">拆除面积</text>
            <text class="info-value">{{ order.demand?.area ? order.demand.area + 'm²' : '--' }}</text>
          </view>
          <view class="info-item" v-if="order.demand?.description">
            <text class="info-label">需求描述</text>
            <text class="info-value">{{ order.demand.description }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">合同金额</text>
            <text class="info-value price">¥{{ order.amount || '--' }}</text>
          </view>
          <view class="info-item" v-if="order.planStartDate">
            <text class="info-label">计划开工</text>
            <text class="info-value">{{ order.planStartDate }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 6. 施工日志时间线 -->
    <view class="card-section">
      <SectionHeader title="施工动态" :show-more="recentLogs.length > 0" @more="goLogs" />
      <view v-if="recentLogs.length > 0" class="section-body">
        <view
          v-for="(log, index) in recentLogs"
          :key="log.id || index"
          class="log-item"
          @click="goLogDetail(log.id)"
        >
          <view class="log-timeline">
            <view class="log-dot" />
            <view v-if="index < recentLogs.length - 1" class="log-line" />
          </view>
          <view class="log-content">
            <text class="log-date">{{ log.createTime || '' }}</text>
            <text class="log-text">{{ log.content || '' }}</text>
            <view v-if="log.imageUrls && log.imageUrls.length > 0" class="log-images">
              <image
                v-for="(img, imgIdx) in log.imageUrls.slice(0, 3)"
                :key="imgIdx"
                class="log-image"
                :src="img"
                mode="aspectFill"
                @click.stop="previewImage(img, log.imageUrls)"
              />
            </view>
          </view>
        </view>
      </view>
      <view v-else class="section-body empty-hint">
        <text class="empty-text">暂无施工日志</text>
      </view>
    </view>

    <!-- 7. 消息记录入口 -->
    <view class="card-section">
      <view class="message-entry" @click="goMessage">
        <view class="message-left">
          <text class="message-icon">&#128172;</text>
          <text class="message-title">消息记录</text>
        </view>
        <text class="message-arrow" decode>{{ '>' }}</text>
      </view>
    </view>

    <!-- 8. 底部操作栏 -->
    <view v-if="showActionBtn" class="bottom-action safe-area-bottom">
      <view v-if="order.status === 3" class="action-row">
        <view class="action-btn action-btn--secondary" @click="goUploadLog">
          <text class="action-text">登记施工日志</text>
        </view>
        <view class="action-btn" @click="handleComplete">
          <text class="action-text">申请完工</text>
        </view>
      </view>
      <view v-else class="action-btn" @click="goUploadLog">
        <text class="action-text">{{ actionBtnText }}</text>
      </view>
    </view>

    <view class="safe-bottom" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrderDetail, completeOrder } from '@/api/order'
import { getConstructionLogs } from '@/api/construction-log'
import { ORDER_STATUS, ORDER_STATUS_COLOR } from '@/utils/constants'
import { showLoading, hideLoading, makePhoneCall, previewImage as previewImageUtil } from '@/utils/util'
import SectionHeader from '@/components/section-header/section-header.vue'
import StatusTag from '@/components/status-tag/status-tag.vue'

const orderId = ref(null)
const order = ref({})
const recentLogs = ref([])

// 进度步骤：待审核→待签约→待开工→施工中→待验收→已完成
const progressSteps = ref([
  { label: '待审核' },
  { label: '待签约' },
  { label: '待开工' },
  { label: '施工中' },
  { label: '待验收' },
  { label: '已完成' }
])

// 当前步骤索引，根据 order.status 映射
const currentStep = computed(() => {
  const status = order.value.status
  // status: 0待审核 1待签约 2待开工 3施工中 4待验收 5已完成 6已取消
  const map = {
    0: 0, // 待审核
    1: 1, // 待签约
    2: 2, // 待开工
    3: 3, // 施工中
    4: 4, // 待验收
    5: 5, // 已完成
    6: 0  // 已取消
  }
  return map[status] ?? 0
})

// 状态颜色
const statusColor = computed(() => {
  return ORDER_STATUS_COLOR[order.value.status] || '#999999'
})

// 状态文字
const statusText = computed(() => {
  return ORDER_STATUS[order.value.status] || '未知'
})

// 是否显示底部操作按钮
const showActionBtn = computed(() => {
  const status = order.value.status
  // 1待签约可以上传合同，3施工中可以完工或上传日志
  return status === 1 || status === 3
})

// 操作按钮文字
const actionBtnText = computed(() => {
  if (order.value.status === 1) {
    return '上传合同'
  }
  if (order.value.status === 3) {
    return '完工申请'
  }
  return ''
})

// 加载订单详情
async function loadDetail() {
  if (!orderId.value) return

  showLoading()
  try {
    const res = await getOrderDetail(orderId.value)
    order.value = res.data || res
  } catch (error) {
    console.error('获取订单详情失败:', error)
  } finally {
    hideLoading()
  }
}

// 加载最近施工日志
async function loadRecentLogs() {
  if (!orderId.value) return

  try {
    const logRes = await getConstructionLogs({
      orderId: orderId.value,
      page: 1,
      pageSize: 3
    })
    const logData = logRes.data || logRes
    recentLogs.value = logData.list || logData.records || []
  } catch (error) {
    console.error('获取施工日志失败:', error)
  }
}

// 拨打电话
function makeCall() {
  makePhoneCall(order.value.demand?.contactPhone)
}

// 预览图片
function previewImage(current, urls) {
  previewImageUtil(current, urls)
}

// 跳转施工日志列表
function goLogs() {
  uni.navigateTo({ url: `/pages/order/logs?orderId=${orderId.value}` })
}

// 跳转施工日志详情
function goLogDetail(logId) {
  uni.navigateTo({ url: `/provider/log/detail?id=${logId}` })
}

// 跳转消息详情
function goMessage() {
  uni.navigateTo({ url: `/pages/message/detail?orderId=${orderId.value}` })
}

// 跳转上传施工日志或合同
function goUploadLog() {
  if (order.value.status === 1) {
    // 待签约 - 上传合同
    uni.navigateTo({ url: `/provider/contract/upload?orderId=${orderId.value}` })
  } else if (order.value.status === 3) {
    // 施工中 - 登记施工日志
    uni.navigateTo({ url: `/provider/log/upload?orderId=${orderId.value}` })
  }
}

// 完工申请
async function handleComplete() {
  uni.showModal({
    title: '完工确认',
    content: '确认施工已完成，申请验收？',
    success: async (res) => {
      if (res.confirm) {
        showLoading('提交中...')
        try {
          await completeOrder(orderId.value)
          hideLoading()
          uni.showToast({ title: '申请成功', icon: 'success' })
          loadDetail()
        } catch (error) {
          hideLoading()
          console.error('完工申请失败:', error.message || error)
          uni.showToast({ title: error.message || '操作失败', icon: 'none' })
        }
      }
    }
  })
}

onLoad((options) => {
  orderId.value = options.id
  loadDetail()
  loadRecentLogs()
})
</script>

<style lang="scss" scoped>
.order-detail-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 0;
}

// ========== 1. 状态头部 ==========
.status-header {
  padding: 48rpx 32rpx 40rpx;
}

.status-header-inner {
  display: flex;
  flex-direction: column;
  padding-bottom: 16rpx;
}

.status-label {
  font-size: $font-size-sm;
  color: rgba(255, 255, 255, 0.8);
}

.status-main {
  display: flex;
  align-items: center;
  padding-left: 16rpx;
}

.status-name {
  font-size: $font-size-xl;
  font-weight: bold;
  color: #FFFFFF;
}

// ========== 2. 订单信息栏 ==========
.order-info-bar {
  background-color: $bg-card;
  padding: 24rpx 32rpx;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.info-col {
  display: flex;
  flex-direction: column;
  padding-bottom: 8rpx;

  &.text-right {
    text-align: right;
  }
}

.info-label {
  font-size: $font-size-xs;
  color: $text-placeholder;
}

.info-value {
  font-size: $font-size-xs;
  color: $text-secondary;
}

// ========== 3. 状态进度条 ==========
.progress-section {
  background-color: $bg-card;
  padding: 40rpx 32rpx;
  margin-bottom: 20rpx;
}

.progress-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.step-dot {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: $border-color;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  z-index: 1;
  transition: all 0.3s;

  .active & {
    background-color: $primary-color;
  }

  .current & {
    box-shadow: 0 0 0 8rpx rgba($primary-color, 0.2);
  }
}

.step-check {
  font-size: 20rpx;
  color: #FFFFFF;
}

.step-label {
  font-size: $font-size-xs;
  color: $text-placeholder;
  transition: all 0.3s;

  .active & {
    color: $primary-color;
    font-weight: bold;
  }
}

.step-line {
  position: absolute;
  top: 20rpx;
  left: calc(50% + 24rpx);
  width: calc(100% - 48rpx);
  height: 4rpx;
  background-color: $border-color;
  transition: background-color 0.3s;

  &.active {
    background-color: $primary-color;
  }
}

// ========== 通用卡片区域 ==========
.card-section {
  background-color: $bg-card;
  margin-bottom: 20rpx;
}

.section-body {
  padding: 0 32rpx 28rpx;
}

// ========== 4. 需求方信息 / 5. 需求信息 ==========
.info-grid {
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  align-items: center;
  padding-bottom: 20rpx;

  &:last-child {
    padding-bottom: 0;
  }
}

.info-label {
  font-size: $font-size-sm;
  color: $text-placeholder;
  width: 160rpx;
  flex-shrink: 0;
}

.info-value {
  font-size: $font-size-sm;
  color: $text-main;
  flex: 1;

  &.address-value {
    line-height: 1.5;
  }

  &.price {
    color: $primary-color;
    font-weight: bold;
  }
}

.call-btn {
  padding: 8rpx 24rpx;
  background-color: $primary-color;
  border-radius: $radius-round;
  flex-shrink: 0;
  margin-left: 16rpx;

  .call-text {
    font-size: $font-size-xs;
    color: #FFFFFF;
  }
}

// ========== 6. 施工日志时间线 ==========
.log-item {
  display: flex;
  padding-bottom: 24rpx;
  position: relative;

  &:not(:last-child) {
    padding-bottom: 28rpx;
  }
}

.log-timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 22rpx;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.log-dot {
  width: 22rpx;
  height: 22rpx;
  border-radius: 50%;
  background-color: $primary-color;
  flex-shrink: 0;
}

.log-line {
  width: 4rpx;
  flex: 1;
  background-color: $border-color;
  margin: 8rpx 0;
}

.log-content {
  flex: 1;
}

.log-date {
  font-size: $font-size-xs;
  color: $text-placeholder;
  display: block;
  margin-bottom: 8rpx;
}

.log-text {
  font-size: $font-size-sm;
  color: $text-main;
  line-height: 1.6;
  display: block;
  margin-bottom: 12rpx;
}

.log-images {
  display: flex;
  flex-wrap: wrap;
}

.log-image {
  width: 140rpx;
  height: 140rpx;
  border-radius: $radius-sm;
  margin-right: 12rpx;
  margin-bottom: 12rpx;

  &:nth-child(3n) {
    margin-right: 0;
  }
}

.empty-hint {
  padding: 40rpx 0;
  display: flex;
  justify-content: center;
}

.empty-text {
  font-size: $font-size-sm;
  color: $text-placeholder;
}

// ========== 7. 消息记录入口 ==========
.message-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
}

.message-left {
  display: flex;
  align-items: center;
}

.message-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.message-title {
  font-size: $font-size-base;
  color: $text-title;
  font-weight: 500;
}

.message-arrow {
  font-size: $font-size-sm;
  color: $text-placeholder;
}

// ========== 8. 底部操作栏 ==========
.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 32rpx;
  background-color: $bg-card;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.action-btn {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $primary-color;
  border-radius: $radius-lg;

  .action-text {
    font-size: $font-size-lg;
    font-weight: bold;
    color: #FFFFFF;
  }

  &--secondary {
    background-color: $bg-gray;
    margin-right: 24rpx;

    .action-text {
      color: $text-main;
    }
  }
}

.action-row {
  display: flex;
  align-items: center;

  .action-btn {
    flex: 1;
  }
}

.safe-bottom {
  height: 140rpx;
}
</style>
