<template>
  <view class="profile-page">
    <!-- 用户信息区域 -->
    <view class="user-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="user-info">
        <image
          class="user-avatar"
          :src="userInfo?.avatarUrl || '/static/avatar-default.png'"
          mode="aspectFill"
        />
        <view class="user-detail">
          <text class="user-name">{{ userInfo?.nickname || userInfo?.realName || '未登录' }}</text>
          <view class="user-role">
            <text class="role-tag">服务方</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 统计区域 -->
    <view class="stats-section">
      <view class="stat-item" @click="goMyQuotes">
        <text class="stat-value">{{ stats.quoteCount || 0 }}</text>
        <text class="stat-label">我的报价</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item" @click="goMyOrders">
        <text class="stat-value">{{ stats.orderCount || 0 }}</text>
        <text class="stat-label">我的订单</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item" @click="goMyCases">
        <text class="stat-value">{{ stats.caseCount || 0 }}</text>
        <text class="stat-label">我的案例</text>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-item" @click="goTeamManage">
          <text class="menu-icon">&#128101;</text>
          <text class="menu-label">团队管理</text>
          <text class="menu-arrow" decode>{{ '>' }}</text>
        </view>
        <view class="menu-item" @click="goCompanyManage">
          <text class="menu-icon">&#127970;</text>
          <text class="menu-label">企业管理</text>
          <text class="menu-arrow" decode>{{ '>' }}</text>
        </view>
        <view class="menu-item" @click="goCaseUpload">
          <text class="menu-icon">&#128247;</text>
          <text class="menu-label">上传案例</text>
          <text class="menu-arrow" decode>{{ '>' }}</text>
        </view>
      </view>

      <view class="menu-group">
        <view class="menu-item" @click="goMessage">
          <text class="menu-icon">&#128276;</text>
          <text class="menu-label">消息通知</text>
          <text class="menu-arrow" decode>{{ '>' }}</text>
        </view>
        <view class="menu-item" @click="goCompliance">
          <text class="menu-icon">&#128220;</text>
          <text class="menu-label">合规知识</text>
          <text class="menu-arrow" decode>{{ '>' }}</text>
        </view>
        <view class="menu-item" @click="goFAQ">
          <text class="menu-icon">&#10067;</text>
          <text class="menu-label">常见问题</text>
          <text class="menu-arrow" decode>{{ '>' }}</text>
        </view>
        <view class="menu-item" @click="goAbout">
          <text class="menu-icon">&#8505;</text>
          <text class="menu-label">关于我们</text>
          <text class="menu-arrow" decode>{{ '>' }}</text>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="menu-group">
        <view class="menu-item logout-item" @click="handleLogout">
          <text class="menu-label logout-text">退出登录</text>
        </view>
      </view>
    </view>

    <!-- 切换角色按钮 -->
    <view class="switch-role-section">
      <view class="switch-btn" @click="handleSwitchRole">
        <text class="switch-text">切换为需求方</text>
      </view>
    </view>

    <!-- 底部导航 -->
    <view class="provider-tabbar safe-area-bottom">
      <view class="tab-item" @click="goHall">
        <text class="tab-icon">&#127968;</text>
        <text class="tab-label">大厅</text>
      </view>
      <view class="tab-item" @click="goMyQuotes">
        <text class="tab-icon">&#128221;</text>
        <text class="tab-label">报价</text>
      </view>
      <view class="tab-item" @click="goMyOrders">
        <text class="tab-icon">&#128196;</text>
        <text class="tab-label">订单</text>
      </view>
      <view class="tab-item">
        <text class="tab-icon">&#128100;</text>
        <text class="tab-label active">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getStatusBarHeight } from '@/utils/util'
import { useUserStore } from '@/store/modules/user'
import { getMyQuotes } from '@/api/quote'
import { getMyOrders } from '@/api/order'

const userStore = useUserStore()
const statusBarHeight = ref(getStatusBarHeight())
const userInfo = computed(() => userStore.userInfo)

const stats = ref({
  quoteCount: 0,
  orderCount: 0,
  caseCount: 0
})

async function loadStats() {
  try {
    const [quoteRes, orderRes] = await Promise.all([
      getMyQuotes({ page: 1, pageSize: 1 }).catch(() => ({ data: { total: 0 } })),
      getMyOrders({ page: 1, pageSize: 1 }).catch(() => ({ data: { total: 0 } }))
    ])
    stats.value.quoteCount = quoteRes?.data?.total || quoteRes?.data?.list?.length || 0
    stats.value.orderCount = orderRes?.data?.total || orderRes?.data?.list?.length || 0
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

async function handleSwitchRole() {
  try {
    await userStore.switchRole(1)
  } catch (error) {
    console.error('切换角色失败:', error)
  }
}

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

function goHall() { uni.reLaunch({ url: '/provider/hall/index' }) }
function goMyQuotes() { uni.navigateTo({ url: '/provider/quote/my-quotes' }) }
function goMyOrders() { uni.navigateTo({ url: '/provider/order/my-orders' }) }
function goMyCases() { uni.navigateTo({ url: '/pages/case/list' }) }
function goTeamManage() { uni.navigateTo({ url: '/provider/team/manage' }) }
function goCompanyManage() { uni.navigateTo({ url: '/provider/company/manage' }) }
function goCaseUpload() { uni.navigateTo({ url: '/provider/case/upload' }) }
function goCompliance() { uni.navigateTo({ url: '/pages/compliance/list' }) }
function goFAQ() { uni.navigateTo({ url: '/pages/faq/index' }) }
function goAbout() { uni.navigateTo({ url: '/pages/about/index' }) }
function goMessage() { uni.navigateTo({ url: '/pages/message/index' }) }

onShow(() => {
  loadStats()
})
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 120rpx;
}

.user-header {
  background: linear-gradient(135deg, $primary-color, $primary-dark);
  padding: 40rpx 32rpx 60rpx;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.user-detail {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.user-name {
  font-size: $font-size-xl;
  font-weight: bold;
  color: #FFFFFF;
}

.user-role {
  .role-tag {
    font-size: $font-size-xs;
    color: rgba(255, 255, 255, 0.85);
    padding: 2rpx 16rpx;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: $radius-round;
  }
}

.stats-section {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: -30rpx 32rpx 20rpx;
  padding: 28rpx 0;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  position: relative;
  z-index: 1;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: $font-size-xl;
  font-weight: bold;
  color: $text-title;
  margin-bottom: 4rpx;
}

.stat-label {
  font-size: $font-size-xs;
  color: $text-placeholder;
}

.stat-divider {
  width: 1rpx;
  height: 48rpx;
  background-color: $border-color;
}

.menu-section {
  padding: 0 32rpx;
}

.menu-group {
  background-color: $bg-card;
  border-radius: $radius-lg;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid $border-color-light;

  &:last-child {
    border-bottom: none;
  }
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.menu-label {
  flex: 1;
  font-size: $font-size-base;
  color: $text-main;
}

.menu-arrow {
  font-size: $font-size-sm;
  color: $text-placeholder;
}

.logout-item {
  justify-content: center;
}

.logout-text {
  font-size: $font-size-base;
  color: $error-color;
  text-align: center;
}

.switch-role-section {
  padding: 40rpx 32rpx;
}

.switch-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  background-color: $bg-card;
  border: 2rpx solid $primary-color;
  border-radius: $radius-lg;

  .switch-text {
    font-size: $font-size-base;
    color: $primary-color;
    font-weight: bold;
  }
}

.provider-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100rpx;
  background-color: $bg-card;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.tab-icon {
  font-size: 40rpx;
}

.tab-label {
  font-size: $font-size-xs;
  color: $text-placeholder;

  &.active {
    color: $primary-color;
  }
}
</style>
