<script>
import { useUserStore } from '@/store/modules/user'
import { getSessionToken } from '@/utils/auth'

export default {
  onLaunch() {
    console.log('App Launch')

    // #ifndef H5
    // 小程序环境
    const sessionToken = getSessionToken()

    if (!sessionToken) {
      // 首次访问：无 sessionToken，跳转登录页进行注册
      uni.reLaunch({ url: '/pages/login/index' })
    } else {
      // 已注册用户：初始化 Pinia store，从本地存储恢复用户信息
      // - userStore.token / sessionToken 在 store 初始化时自动从 storage 读取
      // - userStore.userInfo 同上
      // - 后续请求带上 sessionToken，由后端 AuthGuard 验证有效性
      // - 若后端返回 401，request 拦截器会清除登录状态并跳转登录页
      useUserStore()
    }
    // #endif
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  }
}
</script>

<style lang="scss">
page {
  background-color: $bg-page;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial,
    sans-serif;
  font-size: 28rpx;
  color: $text-main;
  line-height: 1.6;
}

/* 全局样式重置 */
view, text, image, scroll-view, swiper, swiper-item {
  box-sizing: border-box;
}

/* 安全区域底部留白 */
.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

/* 单行文本溢出省略 */
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 多行文本溢出省略 */
.ellipsis-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* flex 布局 */
.flex {
  display: flex;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.flex-1 {
  flex: 1;
}

/* 价格样式 */
.price {
  color: $primary-color;
  font-weight: bold;

  &::before {
    content: '¥';
    font-size: 0.7em;
  }
}
</style>
