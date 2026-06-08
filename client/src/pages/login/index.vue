<template>
  <view class="login-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="circle circle-1" />
      <view class="circle circle-2" />
    </view>

    <!-- Logo 和标题 -->
    <view class="logo-section">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="app-name">拆除服务平台</text>
      <text class="app-desc">专业拆除 · 安全合规 · 高效便捷</text>
    </view>

    <!-- H5 账号密码登录 -->
    <!-- #ifdef H5 -->
    <view class="login-section">
      <view class="form-area">
        <view class="input-group">
          <input
            v-model="account"
            class="input-field"
            type="text"
            placeholder="请输入手机号/用户名"
            maxlength="50"
          />
        </view>
        <view class="input-group">
          <input
            v-model="password"
            class="input-field"
            type="password"
            placeholder="请输入密码"
            maxlength="50"
          />
        </view>
      </view>

      <view class="login-btn password-btn" @click="handlePasswordLogin">
        <text class="btn-text">登 录</text>
      </view>
    </view>
    <!-- #endif -->

    <!-- 小程序环境：微信登录 -->
    <!-- #ifndef H5 -->
    <view class="login-section">
      <!-- 状态1：加载中 -->
      <view class="login-btn phone-btn loading-btn" v-if="loginStep === 'loading'">
        <text class="btn-text">正在登录...</text>
      </view>

      <!-- 状态2：微信一键登录（首次或非首次都先走这个） -->
      <view class="login-btn phone-btn" v-else-if="loginStep === 'wechat'" @click="handleWechatLogin">
        <text class="btn-icon">&#127968;</text>
        <text class="btn-text">微信一键登录</text>
      </view>

      <!-- 状态3：需要绑定手机号 -->
      <view class="login-section bind-phone-section" v-else-if="loginStep === 'bindPhone'">
        <text class="bind-phone-hint">首次登录需要验证手机号</text>
        <button
          class="phone-auth-btn"
          open-type="getRealtimePhoneNumber"
          :disabled="phoneAuthDisabled"
          @getrealtimephonenumber="onGetPhoneNumber"
          @error="onPhoneAuthError"
        >
          <text class="btn-icon">&#128241;</text>
          <text class="btn-text">手机号快捷登录</text>
        </button>
        <!-- 开发测试用：跳过手机号绑定（生产环境可移除此按钮） -->
        <!-- #ifdef MP-WEIXIN -->
        <view class="login-btn skip-btn" @click="handleSkipBindPhone">
          <text class="btn-text skip-text">开发测试：跳过验证</text>
        </view>
        <!-- #endif -->
      </view>

      <!-- 状态4：已登录状态 -->
      <view class="login-btn" v-else-if="loginStep === 'done'" @click="goBack">
        <text class="btn-text">已登录，返回</text>
      </view>
    </view>
    <!-- #endif -->

    <!-- 底部版权 -->
    <view class="footer">
      <text class="footer-text">v1.0.0</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { showSuccess } from '@/utils/util'

const userStore = useUserStore()

// 登录步骤状态机：wechat -> loading -> bindPhone | done
const loginStep = ref('wechat')  // 默认显示微信登录按钮
const phoneAuthDisabled = ref(false) // 防止重复授权手机号（实时验证有额度限制）

// H5 账号密码登录
const account = ref('')
const password = ref('')

/**
 * 组件挂载时：自动触发微信登录
 * 这样用户打开登录页即进入流程，无需额外点击
 */
onMounted(() => {
  // #ifndef H5
  // 小程序环境：自动触发微信登录（页面加载即登录）
  handleWechatLogin()
  // #endif
})

/**
 * Step 1：微信小程序一键登录
 * 通过 wx.login 获取 code，后端换取 openId，判断是否为新用户
 */
async function handleWechatLogin() {
  loginStep.value = 'loading'

  try {
    // 获取微信登录 code
    const loginRes = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject,
      })
    })

    if (!loginRes.code) {
      uni.showToast({ title: '微信登录失败，请重试', icon: 'none' })
      loginStep.value = 'wechat'
      return
    }

    // 调用后端微信登录接口（Step 1）
    const data = await userStore.loginByWechat(loginRes.code)
    // console.log('userStore.loginByWechat',data);
    // 根据 phone 是否为空决定下一步
    if (data.needPhone) {
      // phone 为空：需要绑定手机号
      loginStep.value = 'bindPhone'
    } else {
      // phone 已存在：直接跳转
      showSuccess('登录成功')
      setTimeout(() => {
        navigateByRole(data.role)
      }, 300)
    }
  } catch (error) {
    loginStep.value = 'wechat'
    console.error('微信登录失败:', error)
  }
}

/**
 * 绑定手机号：获取手机号授权
 * 使用实时手机号验证组件 getRealtimePhoneNumber
 */
async function onGetPhoneNumber(e) {
  // 文档要求：触发回调后立即禁用按钮，避免重复授权产生额外费用
  phoneAuthDisabled.value = true

  // 拒绝授权时，提示用户需要手机号才能完整使用
  if (e.detail.errMsg !== 'getRealtimePhoneNumber:ok') {
    phoneAuthDisabled.value = false
    uni.showToast({ title: '需要验证手机号才能完整使用', icon: 'none' })
    return
  }

  const phoneCode = e.detail.code
  if (!phoneCode) {
    uni.showToast({ title: '获取手机号失败，请重试', icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: '绑定中...' })
    const data = await userStore.bindPhoneForNewUserAccount(phoneCode)
    uni.hideLoading()
    showSuccess('绑定成功')

    setTimeout(() => {
      navigateByRole(data.role)
    }, 300)
  } catch (error) {
    uni.hideLoading()
    console.error('绑定手机号失败:', error)
    phoneAuthDisabled.value = false
  }
}

/**
 * 手机号授权失败的回调（如用户在授权前取消、或真实手机号接口报错）
 * 微信开发者工具不支持 real phone 验证，会触发此回调
 */
function onPhoneAuthError(e) {
  console.error('手机号授权失败:', e.detail?.errMsg)
  // 微信开发者工具中直接提示开发测试可跳过
  uni.showModal({
    title: '提示',
    content: '开发者工具不支持实时手机号验证，请在手机真机上测试。或点击下方"开发测试：跳过验证"继续。',
    showCancel: false,
    confirmText: '知道了',
  })
}

/**
 * 跳过手机号绑定（仅开发测试用）
 * 用户已通过微信登录，只是跳过手机号绑定
 */
function handleSkipBindPhone() {
  // 暂不绑定也可继续使用，跳转到首页
  showSuccess('可随时在个人中心绑定手机号')
  setTimeout(() => {
    navigateByRole(userStore.currentRole)
  }, 300)
}

/**
 * H5 账号密码登录
 */
async function handlePasswordLogin() {
  if (!account.value) {
    uni.showToast({ title: '请输入账号', icon: 'none' })
    return
  }
  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: '登录中...' })
    const data = await userStore.loginByPassword(account.value, password.value)
    uni.hideLoading()
    showSuccess('登录成功')

    setTimeout(() => {
      navigateByRole(data.role)
    }, 300)
  } catch (error) {
    uni.hideLoading()
    console.error('登录失败:', error)
  }
}

/**
 * 根据角色跳转到对应页面
 */
function navigateByRole(role) {
  if (role === 2) {
    uni.reLaunch({ url: '/provider/hall/index' })
  } else {
    uni.switchTab({ url: '/pages/index/index' })
  }
}

function goBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 0 60rpx;
  position: relative;
  overflow: hidden;
  background-color: $bg-card;
}

.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 600rpx;
  background: linear-gradient(135deg, $primary-color, $primary-dark);
  border-radius: 0 0 50% 50%;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.08);

  &.circle-1 {
    width: 300rpx;
    height: 300rpx;
    top: -100rpx;
    right: -80rpx;
  }

  &.circle-2 {
    width: 200rpx;
    height: 200rpx;
    top: 200rpx;
    left: -60rpx;
  }
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 320rpx;
  position: relative;
  z-index: 1;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-xl;
  margin-bottom: 32rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.app-name {
  font-size: $font-size-title;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 12rpx;
}

.app-desc {
  font-size: $font-size-sm;
  color: rgba(255, 255, 255, 0.75);
}

.login-section {
  width: 100%;
  position: relative;
  z-index: 1;
}

.bind-phone-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.bind-phone-hint {
  font-size: $font-size-base;
  color: $text-secondary;
  text-align: center;
  margin-bottom: 8rpx;
}

.form-area {
  margin-bottom: 32rpx;
}

.input-group {
  display: flex;
  align-items: center;
  height: 96rpx;
  background-color: #F5F7FA;
  border-radius: $radius-lg;
  padding: 0 32rpx;
  margin-bottom: 24rpx;
}

.input-field {
  flex: 1;
  font-size: $font-size-base;
  color: $text-main;
  height: 96rpx;
}

.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  height: 96rpx;
  border-radius: $radius-lg;
  margin-bottom: 32rpx;

  &:active {
    opacity: 0.85;
  }

  &.password-btn {
    background-color: $primary-color;
  }

  &.loading-btn {
    background-color: rgba($primary-color, 0.6);
    cursor: not-allowed;
  }

  &.skip-btn {
    background-color: transparent;
    border: 1px solid rgba($primary-color, 0.3);
  }
}

// 微信手机号授权按钮（独立 button，完整样式无 view 包装）
.phone-auth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
  height: 96rpx;
  background-color: #07C160;
  border: 0 !important; // 彻底清除 button 默认边框
  border-radius: 48rpx; // 胶囊按钮
  padding: 0;
  margin: 0;
  box-shadow: 0 4rpx 16rpx rgba(7, 193, 96, 0.3); // 绿色阴影提升质感

  // 清除 button 所有伪元素边框
  &::after {
    display: none;
  }

  // 按下态
  &:active {
    opacity: 0.85;
    box-shadow: 0 2rpx 8rpx rgba(7, 193, 96, 0.2);
  }
}

.phone-btn {
  background-color: #07C160;
}

.skip-text {
  color: $primary-color;
}

.btn-icon {
  font-size: 40rpx;
}

.btn-text {
  font-size: $font-size-lg;
  font-weight: bold;
  // color: #FFFFFF;
}

.footer {
  padding-bottom: 60rpx;
  position: relative;
  z-index: 1;

  .footer-text {
    font-size: $font-size-xs;
    color: $text-placeholder;
  }
}
</style>
