import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getToken,
  setToken,
  removeToken,
  getSessionToken,
  setSessionToken,
  getUserInfo,
  setUserInfo,
  clearAuth,
  setCurrentRole,
  isLoggedIn,
  getNeedPhone,
  setNeedPhone
} from '@/utils/auth'
import { userLogin, h5Login, phoneLogin, switchUserRole, bindPhoneForNewUser } from '@/api/auth'
import { getUserProfile, getUserRoles } from '@/api/user'
import { showSuccess } from '@/utils/util'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(getToken() || '')
  const sessionToken = ref(getSessionToken() || '')
  const userInfo = ref(getUserInfo() || null)
  const roles = ref([1]) // 用户拥有的角色列表
  const currentRole = ref(uni.getStorageSync('currentRole') || 1) // 当前选中的角色
  // 标记当前会话是否需要绑定手机号（phone 为空时为 true）
  const needPhone = ref(getNeedPhone() || false)

  // 计算属性
  const isLoggedInVal = computed(() => !!(token.value || sessionToken.value))
  const isDemander = computed(() => currentRole.value === 1)
  const isProvider = computed(() => currentRole.value === 2)
  const userName = computed(() => userInfo.value?.nickname || userInfo.value?.realName || '用户')
  const hasMultipleRoles = computed(() => roles.value.length > 1) // 是否有多个角色

  // ==================== 内部辅助方法 ====================

  /**
   * 解析角色列表
   */
  function parseRoles(data) {
    if (Array.isArray(data)) return data
    if (typeof data === 'string') {
      try {
        return JSON.parse(data)
      } catch {
        return [1]
      }
    }
    return [1]
  }

  /**
   * 存储通用登录结果（SessionToken + 用户信息）
   */
  function _storeLoginResult(data) {
    // 存储 sessionToken
    if (data.sessionToken) {
      sessionToken.value = data.sessionToken
      setSessionToken(data.sessionToken)
    }

    // 解析用户角色
    const userRoles = parseRoles(data.roles)

    const info = {
      userId: data.userId,
      nickname: data.nickname,
      realName: data.realName,
      avatarUrl: data.avatarUrl,
      phone: data.phone,
      roles: userRoles,
    }
    userInfo.value = info
    setUserInfo(info)

    // 更新角色列表
    roles.value = userRoles

    // 优先使用服务端返回的 currentRole，其次使用本地存储，最后默认为需求方
    const targetRole = data.currentRole ?? uni.getStorageSync('currentRole') ?? 1
    currentRole.value = targetRole
    setCurrentRole(targetRole)

    // 存储 needPhone 标志（phone 为空时为 true）
    if (data.needPhone !== undefined) {
      needPhone.value = data.needPhone
      setNeedPhone(data.needPhone)
    }
  }

  // ==================== 登录方法 ====================

  /**
   * 微信小程序登录（Step 1：微信身份认证）
   * 仅通过 wx.login 的 code 进行微信身份认证，不获取手机号
   * @param {string} loginCode - wx.login 返回的 code，用于换取 openId
   * @returns {Object} - 包含 needPhone 标志和 sessionToken
   */
  async function loginByWechat(loginCode) {
    try {
      const res = await userLogin({ code: loginCode })
      const data = res.data || res

      _storeLoginResult(data)

      return {
        userId: data.userId,
        needPhone: data.needPhone,
        sessionToken: data.sessionToken,
        roles: data.roles,
        currentRole: data.currentRole,
      }
    } catch (error) {
      console.error('微信登录失败:', error)
      throw error
    }
  }

  /**
   * 微信用户绑定手机号
   * 用户已登录但 phone 为空时调用此方法完成手机号绑定
   * @param {string} phoneCode - getRealtimePhoneNumber 返回的 code
   * @returns {Object} - 绑定手机号后的用户信息
   */
  async function bindPhoneForNewUserAccount(phoneCode) {
    try {
      const res = await bindPhoneForNewUser({ code: phoneCode })
      const data = res.data || res

      // 重新存储用户信息（此时 phone 字段已有值）
      const userRoles = parseRoles(data.roles)
      const info = {
        userId: data.userId,
        nickname: data.nickname,
        realName: data.realName,
        avatarUrl: data.avatarUrl,
        phone: data.phone,
        roles: userRoles,
      }
      userInfo.value = info
      setUserInfo(info)

      // 更新角色列表
      if (data.roles) {
        roles.value = userRoles
      }

      // 绑定成功后，清除 needPhone 标志（phone 已填充）
      needPhone.value = false
      setNeedPhone(false)

      return {
        userId: data.userId,
        roles: userRoles,
        phone: data.phone,
      }
    } catch (error) {
      console.error('绑定手机号失败:', error)
      throw error
    }
  }

  /**
   * 微信登录（旧版，保留兼容）
   */
  async function login() {
    try {
      const loginRes = await new Promise((resolve, reject) => {
        uni.login({
          provider: 'weixin',
          success: resolve,
          fail: reject
        })
      })

      const code = loginRes.code
      const res = await userLogin({ code })
      const data = res.data || res

      token.value = data.token
      setToken(data.token)

      if (data.userInfo) {
        userInfo.value = data.userInfo
        setUserInfo(data.userInfo)
      }

      // 解析角色
      const userRoles = parseRoles(data.roles || data.userInfo?.roles)
      roles.value = userRoles

      if (data.currentRole !== undefined) {
        currentRole.value = data.currentRole
        setCurrentRole(data.currentRole)
      } else if (data.userInfo?.currentRole !== undefined) {
        currentRole.value = data.userInfo.currentRole
        setCurrentRole(data.userInfo.currentRole)
      }

      return data
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  /**
   * 微信手机号快速登录（小程序端使用，仅用于 H5 端兼容）
   * @param {string} code - getPhoneNumber 返回的 code
   */
  async function loginByPhone(code) {
    try {
      const res = await phoneLogin({ code })
      const data = res.data || res

      _storeLoginResult(data)

      return data
    } catch (error) {
      console.error('手机号登录失败:', error)
      throw error
    }
  }

  /**
   * H5 账号密码登录
   */
  async function loginByPassword(account, password) {
    try {
      const res = await h5Login({ account, password })
      const data = res.data || res

      token.value = data.accessToken
      setToken(data.accessToken)

      // 解析角色
      const userRoles = parseRoles(data.roles)
      roles.value = userRoles

      const info = {
        userId: data.userId,
        nickname: data.nickname,
        realName: data.realName,
        avatarUrl: data.avatarUrl,
        phone: data.phone,
        roles: userRoles,
      }
      userInfo.value = info
      setUserInfo(info)

      if (data.currentRole !== undefined) {
        currentRole.value = data.currentRole
        setCurrentRole(data.currentRole)
      }

      return data
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  // ==================== 用户信息方法 ====================

  /**
   * 获取用户信息
   */
  async function fetchUserInfo() {
    try {
      const res = await getUserProfile()
      const data = res.data || res
      // 解析角色
      const userRoles = parseRoles(data.roles)
      roles.value = userRoles
      currentRole.value = data.currentRole || 1
      userInfo.value = {
        ...data,
        roles: userRoles,
      }
      setUserInfo({
        ...data,
        roles: userRoles,
      })
      return data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  /**
   * 获取用户角色信息
   */
  async function fetchUserRoles() {
    try {
      const res = await getUserRoles()
      const data = res.data || res
      roles.value = parseRoles(data.roles)
      currentRole.value = data.currentRole || 1
    } catch (error) {
      console.error('获取用户角色失败:', error)
    }
  }

  // ==================== 角色切换方法 ====================

  /**
   * 切换角色
   * @param {number} role - 目标角色：1=需求方 2=服务方
   */
  async function switchRole(role) {
    // 校验：目标角色是否在用户已分配的角色列表中
    if (!roles.value.includes(role)) {
      uni.showToast({
        title: '无权切换到该角色，请联系运营人员',
        icon: 'none'
      })
      return
    }

    try {
      await switchUserRole({ role })
      currentRole.value = role
      setCurrentRole(role)
      showSuccess('角色切换成功')

      if (role === 2) {
        uni.reLaunch({ url: '/provider/hall/index' })
      } else {
        uni.reLaunch({ url: '/pages/index/index' })
      }
    } catch (error) {
      console.error('切换角色失败:', error)
      throw error
    }
  }

  // ==================== 退出登录 ====================

  /**
   * 退出登录
   */
  function logout() {
    token.value = ''
    sessionToken.value = ''
    userInfo.value = null
    roles.value = [1]
    currentRole.value = 1
    needPhone.value = false
    clearAuth()
    uni.reLaunch({ url: '/pages/login/index' })
  }

  // ==================== 返回 ====================

  return {
    token,
    sessionToken,
    userInfo,
    roles,
    currentRole,
    needPhone,
    isLoggedIn: isLoggedInVal,
    isDemander,
    isProvider,
    hasMultipleRoles,
    userName,
    login,
    loginByWechat,
    loginByPhone,
    loginByPassword,
    bindPhoneForNewUserAccount,
    fetchUserInfo,
    fetchUserRoles,
    switchRole,
    logout
  }
})
