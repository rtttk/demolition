/**
 * 文件上传相关 API
 */
import { uploadFile, get } from '@/utils/request'

/**
 * 上传单个文件
 * @param {string} filePath 本地文件路径
 * @param {Object} formData 额外表单数据
 */
export function uploadSingleFile(filePath, formData = {}) {
  return uploadFile('/files/upload', filePath, formData)
}

/**
 * 批量上传文件
 * @param {Array<string}} filePaths 本地文件路径数组
 * @param {Object} formData 额外表单数据
 */
export async function uploadBatchFiles(filePaths, formData = {}) {
  const results = []
  for (const filePath of filePaths) {
    try {
      const res = await uploadFile('/files/upload', filePath, formData)
      results.push(res)
    } catch (error) {
      console.error(`文件上传失败: ${filePath}`, error)
      results.push(null)
    }
  }
  return results
}

/**
 * 获取文件信息
 * @param {number|string} id 文件ID
 */
export function getFileInfo(id) {
  return get(`/files/${id}`)
}
