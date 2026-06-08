<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="分类">
          <el-select v-model="queryParams.category" placeholder="全部" clearable style="width: 130px">
            <el-option
              v-for="(label, value) in COMPLIANCE_CATEGORIES"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
          <el-button type="success" icon="Plus" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never" class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="110">
          <template #default="{ row }">
            {{ COMPLIANCE_CATEGORIES[row.category] || row.category }}
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="fetchData"
        @current-change="fetchData"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="formVisible" :title="isEdit ? '编辑合规文档' : '新增合规文档'" width="600px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="formData.category" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="(label, value) in COMPLIANCE_CATEGORIES"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="上传文件">
          <el-upload
            class="compliance-uploader"
            :action="''"
            :http-request="handleUpload"
            :before-upload="beforeUpload"
            :on-remove="handleRemoveFile"
            :file-list="fileList"
            :limit="1"
            :on-exceed="handleExceed"
            accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
          >
            <el-button type="primary" :icon="Upload">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持图片(jpg/png/webp ≤5MB)和文档(pdf/doc/docx ≤10MB)
              </div>
            </template>
          </el-upload>
          <div v-if="formData.fileUrl && isImageFile(formData.fileUrl)" class="file-preview">
            <el-image
              :src="formData.fileUrl"
              :preview-src-list="[formData.fileUrl]"
              fit="contain"
              style="max-width: 200px; max-height: 150px; border-radius: 4px;"
            />
          </div>
          <div v-if="formData.fileUrl && !isImageFile(formData.fileUrl)" class="file-preview">
            <el-link type="primary" :href="formData.fileUrl" target="_blank">
              {{ formData.fileUrl.split('/').pop() }}
            </el-link>
          </div>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.sortOrder" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态" v-if="isEdit">
          <el-switch
            v-model="formData.status"
            :active-value="1"
            :inactive-value="0"
            inline-prompt
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="formLoading" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  getComplianceList,
  createCompliance,
  updateCompliance,
  deleteCompliance,
  uploadFile
} from '@/api/compliance'
import { COMPLIANCE_CATEGORIES } from '@/utils/constants'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const formVisible = ref(false)
const formLoading = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const currentRow = ref(null)
const fileList = ref([])

const queryParams = reactive({
  page: 1,
  pageSize: 20,
  category: undefined
})

const formData = reactive({
  title: '',
  category: '',
  description: '',
  fileId: '',
  fileUrl: '',
  sortOrder: 0,
  status: 1
})

const formRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const data = await getComplianceList(queryParams)
    tableData.value = data.list || []
    total.value = data.total || 0
  } catch (error) {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.category = undefined
  queryParams.page = 1
  fetchData()
}

const resetForm = () => {
  formData.title = ''
  formData.category = ''
  formData.description = ''
  formData.fileId = ''
  formData.fileUrl = ''
  formData.sortOrder = 0
  formData.status = 1
  fileList.value = []
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  formVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  currentRow.value = row
  Object.assign(formData, {
    title: row.title,
    category: row.category,
    description: row.description || '',
    fileId: row.fileId || '',
    fileUrl: row.fileUrl || '',
    sortOrder: row.sortOrder || 0,
    status: row.status
  })
  // 如果已有文件，设置 fileList 用于展示
  if (row.fileUrl) {
    const fileName = row.fileUrl.split('/').pop()
    fileList.value = [{ name: fileName, url: row.fileUrl }]
  } else {
    fileList.value = []
  }
  formVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    formLoading.value = true
    try {
      if (isEdit.value) {
        await updateCompliance(currentRow.value.id, formData)
        ElMessage.success('更新成功')
      } else {
        await createCompliance(formData)
        ElMessage.success('创建成功')
      }
      formVisible.value = false
      fetchData()
    } catch (error) {
      // handled by interceptor
    } finally {
      formLoading.value = false
    }
  })
}

// 判断是否为图片文件
const isImageFile = (url) => {
  if (!url) return false
  const ext = url.split('.').pop().toLowerCase().split('?')[0]
  return ['jpg', 'jpeg', 'png', 'webp'].includes(ext)
}

// 上传前校验
const beforeUpload = (file) => {
  const isImage = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
  const isDoc = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ].includes(file.type)

  if (!isImage && !isDoc) {
    ElMessage.error('仅支持图片(jpg/png/webp)和文档(pdf/doc/docx)格式')
    return false
  }

  if (isImage && file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  if (isDoc && file.size > 10 * 1024 * 1024) {
    ElMessage.error('文档大小不能超过 10MB')
    return false
  }

  return true
}

// 自定义上传
const handleUpload = async ({ file }) => {
  try {
    const res = await uploadFile(file)
    formData.fileId = res.id
    formData.fileUrl = res.fileUrl
    ElMessage.success('文件上传成功')
  } catch (error) {
    // handled by interceptor
  }
}

// 移除文件
const handleRemoveFile = () => {
  formData.fileId = ''
  formData.fileUrl = ''
  fileList.value = []
}

// 超出限制提示
const handleExceed = () => {
  ElMessage.warning('只能上传一个文件，请先移除已有文件')
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该合规文档？此操作不可恢复。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteCompliance(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      // handled by interceptor
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>
