/**
 * 认证相关 API
 */
import { post, get, put } from '@/utils/request'

/**
 * 微信小程序登录（Step 1：微信身份认证）
 * 调用 wx.login 获取 code 后传入，后端通过 code 换取 openId，查询/创建用户
 * 返回 needPhone 标志（phone 为空时为 true）和 sessionToken
 * @param {Object} data - { code: string } wx.login 返回的 code
 */
export function userLogin(data) {
  return post('/auth/wechat-login', data)
}

/**
 * 首次注册用户绑定手机号（Step 2）
 * 仅新用户首次登录时调用，使用实时手机号验证组件
 * @param {Object} data - { code: string } getRealtimePhoneNumber 返回的 code
 */
export function bindPhoneForNewUser(data) {
  return post('/auth/bind-phone', data)
}

/**
 * 微信手机号快速登录（保留兼容，非新用户流程）
 * @param {Object} data - { code: string }
 */
export function phoneLogin(data) {
  return post('/auth/phone-login', data)
}

/**
 * H5 账号密码登录
 * @param {Object} data - { account: string, password: string }
 */
export function h5Login(data) {
  return post('/auth/h5-login', data)
}

/**
 * 管理员登录
 * @param {Object} data - { username, password }
 */
export function adminLogin(data) {
  return post('/auth/admin/login', data)
}

/**
 * 切换用户角色
 * @param {Object} data - { role: number }
 */
export function switchUserRole(data) {
  return put('/users/role', data)
}
