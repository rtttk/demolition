import { STORAGE_KEYS } from './constants'

/**
 * 获取 Token（JWT）
 */
export function getToken() {
  return uni.getStorageSync(STORAGE_KEYS.TOKEN) || ''
}

/**
 * 设置 Token（JWT）
 */
export function setToken(token) {
uni.setStorageSync(STORAGE_KEYS.TOKEN, token)
}

/**
 * 移除 Token（JWT）
 */
export function removeToken() {
  uni.removeStorageSync(STORAGE_KEYS.TOKEN)
}

/**
 * 获取 SessionToken（小程序 Redis 登录凭证）
 */
export function getSessionToken() {
  return uni.getStorageSync(STORAGE_KEYS.SESSION_TOKEN) || ''
}

/**
 * 设置 SessionToken（小程序 Redis 登录凭证）
 */
export function setSessionToken(token) {
  uni.setStorageSync(STORAGE_KEYS.SESSION_TOKEN, token)
}

/**
 * 移除 SessionToken
 */
export function removeSessionToken() {
  uni.removeStorageSync(STORAGE_KEYS.SESSION_TOKEN)
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  try {
    const info = uni.getStorageSync(STORAGE_KEYS.USER_INFO)
    return info ? JSON.parse(info) : null
  } catch (e) {
    return null
  }
}

/**
 * 设置用户信息
 */
export function setUserInfo(info) {
  uni.setStorageSync(STORAGE_KEYS.USER_INFO, JSON.stringify(info))
}

/**
 * 移除用户信息
 */
export function removeUserInfo() {
  uni.removeStorageSync(STORAGE_KEYS.USER_INFO)
}

/**
 * 获取当前角色
 */
export function getCurrentRole() {
  return uni.getStorageSync(STORAGE_KEYS.CURRENT_ROLE) || 1
}

/**
 * 设置当前角色
 */
export function setCurrentRole(role) {
  uni.setStorageSync(STORAGE_KEYS.CURRENT_ROLE, role)
}

/**
 * 清除所有登录信息
 */
export function clearAuth() {
  removeToken()
  removeSessionToken()
  removeUserInfo()
  uni.removeStorageSync(STORAGE_KEYS.CURRENT_ROLE)
  uni.removeStorageSync(STORAGE_KEYS.NEED_PHONE)
}

/**
 * 判断是否已登录（JWT 或 SessionToken 任一存在）
 */
export function isLoggedIn() {
  return !!(getToken() || getSessionToken())
}

/**
 * 获取是否需要绑定手机号标志（phone 为空时返回 true）
 */
export function getNeedPhone() {
  return uni.getStorageSync(STORAGE_KEYS.NEED_PHONE) === true
}

/**
 * 设置是否需要绑定手机号标志
 */
export function setNeedPhone(value) {
  uni.setStorageSync(STORAGE_KEYS.NEED_PHONE, value)
}

/**
 * 移除是否需要绑定手机号标志
 */
export function removeNeedPhone() {
  uni.removeStorageSync(STORAGE_KEYS.NEED_PHONE)
}
