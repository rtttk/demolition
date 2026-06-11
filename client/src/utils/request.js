/**
 * HTTP 请求封装
 */
import { API_BASE_URL } from './constants'
import { getToken, getSessionToken, clearAuth } from './auth'

/**
 * 请求拦截器
 * 同时携带 JWT（Authorization）和 SessionToken（X-Session-Token）
 */
function requestInterceptor(config) {
  const token = getToken()
  const sessionToken = getSessionToken()
  config.header = config.header || {}
  if (token) {
    config.header['Authorization'] = `Bearer ${token}`
  }
  if (sessionToken) {
    config.header['X-Session-Token'] = sessionToken
  }
  return config
}

/**
 * 响应拦截器
 */
function responseInterceptor(response) {
  const { statusCode, data } = response

  // HTTP 状态码检查
  if (statusCode === 401) {
    // Token 过期或无效，清除登录信息并跳转登录页
    clearAuth()
    uni.reLaunch({ url: '/pages/login/index' })
    throw new Error('登录已过期，请重新登录')
  }

  if (statusCode === 403) {
    uni.showToast({ title: '无权限访问', icon: 'none' })
    throw new Error('无权限访问')
  }

  if (statusCode === 500) {
    uni.showToast({ title: '服务器错误', icon: 'none' })
    throw new Error('服务器错误')
  }

  if (statusCode < 200 || statusCode >= 300) {
    let errMsg = data?.message || `请求失败(${statusCode})`
    // 确保 errMsg 是字符串
    if (Array.isArray(errMsg)) {
      errMsg = errMsg.join(', ')
    } else if (typeof errMsg !== 'string') {
      errMsg = `请求失败(${statusCode})`
    }
    uni.showToast({ title: errMsg, icon: 'none' })
    throw new Error(errMsg)
  }

  // 业务状态码检查
  if (data.code !== undefined && data.code !== 0 && data.code !== 200) {
    const errMsg = data.message || '操作失败'
    uni.showToast({ title: errMsg, icon: 'none' })
    throw new Error(errMsg)
  }

  return data
}

/**
 * 基础请求方法
 */
function baseRequest(options) {
  return new Promise((resolve, reject) => {
    const { url, ...restOptions } = options
    const config = requestInterceptor({
      url: API_BASE_URL + url,
      method: restOptions.method || 'GET',
      data: restOptions.data || {},
      header: {
        'Content-Type': 'application/json',
        ...restOptions.header
      },
      ...restOptions
    })
    // config.url = API_BASE_URL + url,

    uni.request({
      ...config,
      success: (res) => {
        try {
          const result = responseInterceptor(res)
          resolve(result)
        } catch (err) {
          reject(err)
        }
      },
      fail: (err) => {
        console.error('请求失败:', err)
        uni.showToast({ title: '网络连接失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

/**
 * GET 请求
 */
export function get(url, params = {}) {
  // 将参数拼接到 URL
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
  const fullUrl = query ? `${url}?${query}` : url
  return baseRequest({ url: fullUrl, method: 'GET' })
}

/**
 * POST 请求
 */
export function post(url, data = {}) {
  return baseRequest({ url, method: 'POST', data })
}

/**
 * PUT 请求
 */
export function put(url, data = {}) {
  return baseRequest({ url, method: 'PUT', data })
}

/**
 * DELETE 请求
 */
export function del(url, data = {}) {
  return baseRequest({ url, method: 'DELETE', data })
}

/**
 * 文件上传
 */
export function uploadFile(url, filePath, formData = {}) {
  return new Promise((resolve, reject) => {
    const token = getToken()
    const sessionToken = getSessionToken()
    const headers = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    if (sessionToken) {
      headers['X-Session-Token'] = sessionToken
    }
    console.log('上传文件请求:', API_BASE_URL + url, 'token:', token ? 'JWT' : (sessionToken ? 'Session' : '无'))
    uni.uploadFile({
      url: API_BASE_URL + url,
      filePath,
      name: 'file',
      formData,
      header: headers,
      success: (res) => {
        console.log('上传响应:', res.statusCode, res.data)
        if (res.statusCode === 200 || res.statusCode === 201) {
          try {
            const data = JSON.parse(res.data)
            if (data.code === 0 || data.code === 200) {
              resolve(data)
            } else {
              reject(new Error(data.message || '上传失败'))
            }
          } catch (e) {
            reject(new Error('解析响应失败'))
          }
        } else if (res.statusCode === 401) {
          clearAuth()
          uni.reLaunch({ url: '/pages/login/index' })
          reject(new Error('登录已过期'))
        } else {
          reject(new Error(`上传失败(${res.statusCode})`))
        }
      },
      fail: (err) => {
        console.error('上传失败:', err)
        uni.showToast({ title: '上传失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

export default {
  get,
  post,
  put,
  del,
  uploadFile
}
