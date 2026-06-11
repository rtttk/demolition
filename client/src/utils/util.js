/**
 * 工具函数
 */

/**
 * 格式化日期
 * @param {string|number|Date} date 日期
 * @param {string} format 格式模板 (YYYY-MM-DD HH:mm:ss)
 * @returns {string}
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化相对时间
 * @param {string|number|Date} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`

  return formatDate(date, 'YYYY-MM-DD')
}

/**
 * 格式化金额
 * @param {number} amount
 * @returns {string}
 */
export function formatMoney(amount) {
  if (amount === null || amount === undefined) return '0.00'
  const num = Number(amount)
  if (isNaN(num)) return '0.00'
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化面积
 * @param {number} area
 * @returns {string}
 */
export function formatArea(area) {
  if (!area) return ''
  return `${area}m²`
}

/**
 * 手机号脱敏
 * @param {string} phone
 * @returns {string}
 */
export function maskPhone(phone) {
  if (!phone || phone.length < 11) return phone || ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 防抖函数
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param {Function} fn
 * @param {number} interval
 * @returns {Function}
 */
export function throttle(fn, interval = 300) {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

/**
 * 显示加载提示
 * @param {string} title
 */
export function showLoading(title = '加载中...') {
  uni.showLoading({ title, mask: true })
}

/**
 * 隐藏加载提示
 */
export function hideLoading() {
  uni.hideLoading()
}

/**
 * 显示成功提示
 * @param {string} title
 */
export function showSuccess(title = '操作成功') {
  uni.showToast({ title, icon: 'success' })
}

/**
 * 显示错误提示
 * @param {string} title
 */
export function showError(title = '操作失败') {
  uni.showToast({ title, icon: 'none' })
}

/**
 * 显示Toast提示
 * @param {string} title
 */
export function showToast(title) {
  uni.showToast({ title, icon: 'none' })
}

/**
 * 显示确认弹窗
 * @param {string} content
 * @param {string} title
 * @returns {Promise<boolean>}
 */
export function showConfirm(content, title = '提示') {
  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      success: (res) => resolve(res.confirm)
    })
  })
}

/**
 * 选择图片
 * @param {number} count
 * @param {Array} sourceType
 * @returns {Promise<Array>}
 */
export function chooseImage(count = 9, sourceType = ['album', 'camera']) {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count,
      sizeType: ['compressed'],
      sourceType,
      success: (res) => resolve(res.tempFilePaths),
      fail: (err) => reject(err)
    })
  })
}

/**
 * 预览图片
 * @param {string} current
 * @param {Array} urls
 */
export function previewImage(current, urls) {
  uni.previewImage({
    current,
    urls
  })
}

/**
 * 拨打电话
 * @param {string} phoneNumber
 */
export function makePhoneCall(phoneNumber) {
  if (!phoneNumber) return
  uni.makePhoneCall({ phoneNumber })
}

/**
 * 复制到剪贴板
 * @param {string} data
 */
export function setClipboardData(data) {
  uni.setClipboardData({
    data,
    success: () => showSuccess('已复制')
  })
}

/**
 * 获取状态栏高度
 * @returns {number}
 */
export function getStatusBarHeight() {
  const sysInfo = uni.getSystemInfoSync()
  return sysInfo.statusBarHeight || 20
}

/**
 * 获取导航栏高度
 * @returns {number}
 */
export function getNavBarHeight() {
  // #ifdef MP-WEIXIN
  const menuButton = uni.getMenuButtonBoundingClientRect()
  return (menuButton.top - getStatusBarHeight()) * 2 + menuButton.height
  // #endif
  // #ifndef MP-WEIXIN
  return 44
  // #endif
}

/**
 * 生成唯一 ID
 * @returns {string}
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}
