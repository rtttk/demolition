<template>
  <view class="my-page">
    <!-- 用户信息区域 - 极简渐变 -->
    <view class="user-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="user-info" @click="handleUserClick">
        <image
          class="user-avatar"
          :src="userInfo?.avatarUrl || '/static/avatar-default.png'"
          mode="aspectFill"
        />
        <view class="user-detail">
          <text class="user-name">{{ userInfo?.nickname || userInfo?.realName || '未登录' }}</text>
          <view class="user-role">
            <text class="role-tag">{{ currentRoleLabel }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 角色切换区域（仅多角色用户显示） -->
    <view v-if="hasMultipleRoles" class="role-switch-section">
      <view class="role-switch-card">
        <view class="role-switch-header">
          <text class="role-switch-title">切换角色</text>
        </view>
        <view class="role-buttons">
          <view
            v-for="role in availableRoles"
            :key="role.value"
            class="role-btn"
            :class="{ active: currentRole === role.value }"
            @click="handleSwitchRole(role.value)"
          >
            <text class="role-btn-text">{{ role.label }}</text>
          </view>
        </view>
        <text class="role-switch-tip">切换后下次打开将保持此角色</text>
      </view>
    </view>

    <!-- 统计区域 - 极简卡片 -->
    <view class="stats-section">
      <view class="stat-item" @click="goMyDemands">
        <text class="stat-value">{{ stats.demandCount || 0 }}</text>
        <text class="stat-label">我的需求</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item" @click="goMyOrders">
        <text class="stat-value">{{ stats.orderCount || 0 }}</text>
        <text class="stat-label">我的订单</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item" @click="goMyReviews">
        <text class="stat-value">{{ stats.reviewCount || 0 }}</text>
        <text class="stat-label">我的评价</text>
      </view>
    </view>

    <!-- 菜单列表 - 极简列表 -->
    <view class="menu-section">
      <!-- 功能菜单 -->
      <view class="menu-group">
        <view class="menu-item" @click="goMyDemands">
          <view class="menu-icon-wrap">
            <image class="menu-icon" src="/static/icons/note.svg" mode="aspectFit" />
          </view>
          <text class="menu-label">我的需求</text>
          <image class="menu-arrow" src="/static/icons/arrow-right.svg" mode="aspectFit" />
        </view>
        <view class="menu-item" @click="goMyOrders">
          <view class="menu-icon-wrap">
            <image class="menu-icon" src="/static/icons/order.svg" mode="aspectFit" />
          </view>
          <text class="menu-label">我的订单</text>
          <image class="menu-arrow" src="/static/icons/arrow-right.svg" mode="aspectFit" />
        </view>
        <view class="menu-item" @click="goMyReviews">
          <view class="menu-icon-wrap">
            <image class="menu-icon" src="/static/icons/star.svg" mode="aspectFit" />
          </view>
          <text class="menu-label">我的评价</text>
          <image class="menu-arrow" src="/static/icons/arrow-right.svg" mode="aspectFit" />
        </view>
      </view>

      <!-- 通知菜单 -->
      <view class="menu-group">
        <view class="menu-item" @click="goMessage">
          <view class="menu-icon-wrap">
            <image class="menu-icon" src="/static/icons/message.svg" mode="aspectFit" />
          </view>
          <text class="menu-label">消息通知</text>
          <view v-if="unreadCount > 0" class="badge">
            <text class="badge-text">{{ unreadCount > 99 ? '99+' : unreadCount }}</text>
          </view>
          <image class="menu-arrow" src="/static/icons/arrow-right.svg" mode="aspectFit" />
        </view>
      </view>

      <!-- 设置菜单 -->
      <view class="menu-group">
        <view class="menu-item" @click="goFAQ">
          <view class="menu-icon-wrap">
            <image class="menu-icon" src="/static/icons/help.svg" mode="aspectFit" />
          </view>
          <text class="menu-label">常见问题</text>
          <image class="menu-arrow" src="/static/icons/arrow-right.svg" mode="aspectFit" />
        </view>
        <view class="menu-item" @click="goAbout">
          <view class="menu-icon-wrap">
            <image class="menu-icon" src="/static/icons/info.svg" mode="aspectFit" />
          </view>
          <text class="menu-label">关于我们</text>
          <image class="menu-arrow" src="/static/icons/arrow-right.svg" mode="aspectFit" />
        </view>
        <view class="menu-item" @click="goFeedback">
          <view class="menu-icon-wrap">
            <image class="menu-icon" src="/static/icons/feedback.svg" mode="aspectFit" />
          </view>
          <text class="menu-label">意见反馈</text>
          <image class="menu-arrow" src="/static/icons/arrow-right.svg" mode="aspectFit" />
        </view>
      </view>

      <!-- 退出登录（单角色用户显示） -->
      <view v-if="!hasMultipleRoles" class="menu-group">
        <view class="menu-item logout-item" @click="handleLogout">
          <view class="menu-icon-wrap">
            <image class="menu-icon logout-icon" src="/static/icons/logout.svg" mode="aspectFit" />
          </view>
          <text class="menu-label logout-text">退出登录</text>
        </view>
      </view>
    </view>

    <!-- 安全区域 -->
    <view class="safe-bottom" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow as onPageShow } from '@dcloudio/uni-app'
import { getStatusBarHeight } from '@/utils/util'
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'
import { ROLE_LIST } from '@/utils/constants'
import { getUserStats } from '@/api/user'

const userStore = useUserStore()
const appStore = useAppStore()
const statusBarHeight = ref(getStatusBarHeight())

const userInfo = computed(() => userStore.userInfo)
const currentRole = computed(() => userStore.currentRole)
const roles = computed(() => userStore.roles)
const hasMultipleRoles = computed(() => userStore.hasMultipleRoles)
const unreadCount = computed(() => appStore.unreadMessageCount)

const currentRoleLabel = computed(() => {
  return currentRole.value === 1 ? '需求方' : '服务方'
})

// 可切换的角色列表（过滤掉当前角色或包含所有可选角色）
const availableRoles = computed(() => {
  return ROLE_LIST.filter(role => roles.value.includes(role.value))
})

// 统计数据
const stats = ref({
  demandCount: 0,
  orderCount: 0,
  reviewCount: 0
})

/**
 * 加载统计数据
 */
async function loadStats() {
  try {
    const res = await getUserStats()
    const data = res.data || res
    stats.value.demandCount = data.demandCount || 0
    stats.value.orderCount = data.orderCount || 0
    stats.value.reviewCount = data.reviewCount || 0
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

/**
 * 点击用户区域
 */
function handleUserClick() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
  }
}

/**
 * 切换角色
 */
async function handleSwitchRole(role) {
  if (role !== currentRole.value) {
    await userStore.switchRole(role)
  }
}

/**
 * 退出登录
 */
function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
      }
    }
  })
}

// 导航方法 - 统一登录检查
function checkLogin() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return false
  }
  return true
}

function goMyDemands() {
  if (checkLogin()) {
    uni.navigateTo({ url: '/pages/demand/my-list' })
  }
}

function goMyOrders() {
  if (checkLogin()) {
    uni.switchTab({ url: '/pages/order/index' })
  }
}

function goMyReviews() {
  if (checkLogin()) {
    uni.navigateTo({ url: '/pages/review/my-list' })
  }
}

function goMessage() {
  if (checkLogin()) {
    uni.switchTab({ url: '/pages/message/index' })
  }
}

function goFAQ() {
  uni.navigateTo({ url: '/pages/compliance/list' })
}

function goAbout() {
  uni.navigateTo({ url: '/pages/about/index' })
}

function goFeedback() {
  if (checkLogin()) {
    uni.navigateTo({ url: '/pages/feedback/index' })
  }
}

onPageShow(() => {
  appStore.fetchUnreadCount()
  // 刷新用户信息以获取最新角色
  if (userStore.isLoggedIn) {
    userStore.fetchUserInfo()
    loadStats()
  }
})
</script>

<style lang="scss" scoped>
.my-page {
  min-height: 100vh;
  background-color: $bg-page;
}

// 用户头部 - 极简纯色
.user-header {
  background: $primary-color;
  padding: 40rpx $spacing-8 80rpx;
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-6;
  cursor: pointer;
  
  &:active {
    opacity: 0.9;
  }
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.2);
}

.user-detail {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.user-name {
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: #FFFFFF;
}

.user-role {
  .role-tag {
    font-size: $font-size-xs;
    color: rgba(255, 255, 255, 0.85);
    padding: $spacing-1 $spacing-3;
    background-color: rgba(255, 255, 255, 0.15);
    border-radius: $radius-full;
  }
}

// 角色切换区域 - 极简卡片
.role-switch-section {
  padding: 0 $spacing-8;
  margin-top: -50rpx;
  position: relative;
  z-index: 1;
}

.role-switch-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-6;
  box-shadow: $shadow-md;
}

.role-switch-header {
  margin-bottom: $spacing-4;
}

.role-switch-title {
  font-size: $font-size-base;
  color: $text-secondary;
}

.role-buttons {
  display: flex;
  gap: $spacing-4;
  margin-bottom: $spacing-3;
}

.role-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid $border-color;
  border-radius: $radius-md;
  background-color: $bg-gray;
  transition: all $transition-fast;

  &.active {
    border-color: $primary-color;
    background-color: $primary-light;
    
    .role-btn-text {
      color: $primary-color;
    }
  }
}

.role-btn-text {
  font-size: $font-size-base;
  color: $text-main;
  font-weight: $font-weight-medium;
}

.role-switch-tip {
  font-size: $font-size-xs;
  color: $text-placeholder;
}

// 统计区域 - 极简卡片
.stats-section {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: $spacing-5 $spacing-8;
  padding: $spacing-6 0;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  cursor: pointer;
  transition: opacity $transition-fast;
  
  &:active {
    opacity: 0.7;
  }
}

.stat-value {
  font-size: $font-size-xxl;
  font-weight: $font-weight-bold;
  color: $text-title;
  margin-bottom: $spacing-1;
}

.stat-label {
  font-size: $font-size-xs;
  color: $text-secondary;
}

.stat-divider {
  width: 1rpx;
  height: 48rpx;
  background-color: $border-color;
}

// 菜单列表 - 极简列表
.menu-section {
  padding: 0 $spacing-8;
}

.menu-group {
  background-color: $bg-card;
  border-radius: $radius-lg;
  margin-bottom: $spacing-5;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: $spacing-5 $spacing-6;
  border-bottom: 1rpx solid $border-color-light;
  cursor: pointer;
  transition: background-color $transition-fast;

  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background-color: $bg-hover;
  }
}

.menu-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: $radius-md;
  background-color: $bg-gray;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $spacing-4;
}

.menu-icon {
  width: 32rpx;
  height: 32rpx;
  color: $text-secondary;
}

.menu-label {
  flex: 1;
  font-size: $font-size-base;
  color: $text-main;
}

.menu-arrow {
  width: 28rpx;
  height: 28rpx;
  color: $text-placeholder;
}

.badge {
  padding: 2rpx 12rpx;
  background-color: $error-color;
  border-radius: $radius-full;
  margin-right: $spacing-3;

  .badge-text {
    font-size: 20rpx;
    color: #FFFFFF;
  }
}

.logout-item {
  .menu-icon-wrap {
    background-color: rgba(239, 68, 68, 0.1);
  }
  
  .logout-icon {
    color: $error-color;
  }
  
  .logout-text {
    color: $error-color;
  }
}

.safe-bottom {
  height: 120rpx;
}
</style>
