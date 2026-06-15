<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="可见" :value="1" />
            <el-option label="不可见" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="团队ID">
          <el-input v-model="queryParams.teamId" placeholder="请输入团队ID" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="拆除类型">
          <el-select v-model="queryParams.demoType" placeholder="全部" clearable style="width: 130px">
            <el-option
              v-for="(label, value) in DEMO_TYPES"
              :key="value"
              :label="label"
              :value="Number(value)"
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
      <el-table :data="tableData" v-loading="loading" stripe border @row-click="handleRowClick">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="teamName" label="施工团队" min-width="120" />
        <el-table-column prop="demoType" label="拆除类型" width="110">
          <template #default="{ row }">
            {{ DEMO_TYPES[row.demoType] || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="area" label="面积(m²)" width="100" align="center" />
        <el-table-column prop="recommended" label="推荐" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.recommended" type="warning" size="small">推荐</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '可见' : '不可见' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="80" align="center" />
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              type="success"
              link
              size="small"
              @click.stop="handleVisible(row)"
            >
              显示
            </el-button>
            <el-button
              v-if="row.status === 1"
              type="warning"
              link
              size="small"
              @click.stop="handleHidden(row)"
            >
              隐藏
            </el-button>
            <el-button
              v-if="!row.recommended"
              type="warning"
              link
              size="small"
              @click.stop="handleRecommend(row)"
            >
              推荐
            </el-button>
            <el-button
              v-else
              type="info"
              link
              size="small"
              @click.stop="handleUnrecommend(row)"
            >
              取消推荐
            </el-button>
            <el-button
              type="primary"
              link
              size="small"
              @click.stop="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              @click.stop="handleDelete(row)"
            >
              删除
            </el-button>
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
    <el-dialog v-model="formVisible" :title="isEdit ? '编辑案例' : '新增案例'" width="700px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="施工团队" prop="teamId">
          <el-select
            v-model="formData.teamId"
            placeholder="请选择团队"
            style="width: 100%"
            :disabled="isEdit"
            filterable
          >
            <el-option
              v-for="team in teamList"
              :key="team.id"
              :label="team.name"
              :value="team.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="案例标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入案例标题" />
        </el-form-item>
        <el-form-item label="拆除类型" prop="demoType">
          <el-select v-model="formData.demoType" placeholder="请选择拆除类型" style="width: 100%">
            <el-option
              v-for="(label, value) in DEMO_TYPES"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="案例描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入案例描述"
          />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="formData.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="面积(m²)">
          <el-input-number v-model="formData.area" :min="0" :precision="2" placeholder="请输入面积" style="width: 100%" />
        </el-form-item>
        <el-form-item label="工期(天)">
          <el-input-number v-model="formData.duration" :min="0" placeholder="请输入工期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="施工前图片">
          <div class="image-upload-wrapper">
            <el-upload
              class="image-uploader"
              :action="''"
              :http-request="(opt) => handleImageUpload(opt, 'before')"
              :before-upload="beforeImageUpload"
              :file-list="beforeImageList"
              :on-remove="(file, fileList) => handleImageRemove(file, fileList, 'before')"
              multiple
              accept="image/jpeg,image/png,image/webp"
              list-type="picture-card"
            >
              <el-icon class="image-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="施工后图片">
          <div class="image-upload-wrapper">
            <el-upload
              class="image-uploader"
              :action="''"
              :http-request="(opt) => handleImageUpload(opt, 'after')"
              :before-upload="beforeImageUpload"
              :file-list="afterImageList"
              :on-remove="(file, fileList) => handleImageRemove(file, fileList, 'after')"
              multiple
              accept="image/jpeg,image/png,image/webp"
              list-type="picture-card"
            >
              <el-icon class="image-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="状态" v-if="isEdit">
          <el-select v-model="formData.status" style="width: 100%">
            <el-option label="不可见" :value="0" />
            <el-option label="可见" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="推荐" v-if="isEdit">
          <el-switch
            v-model="formData.recommended"
            :active-value="true"
            :inactive-value="false"
            inline-prompt
            active-text="是"
            inactive-text="否"
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
import { getCaseList, updateCaseStatus, createCase, updateCase, uploadFile } from '@/api/case'
import { getAllTeams } from '@/api/team'
import { DEMO_TYPES } from '@/utils/constants'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const formVisible = ref(false)
const formLoading = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const currentRow = ref(null)
const teamList = ref([])

const queryParams = reactive({
  page: 1,
  pageSize: 20,
  status: undefined,
  teamId: '',
  demoType: undefined
})

const formData = reactive({
  teamId: '',
  title: '',
  demoType: undefined,
  description: '',
  address: '',
  area: null,
  duration: null,
  beforeImageIds: [],
  afterImageIds: [],
  status: 1,
  recommended: false
})

const formRules = {
  teamId: [{ required: true, message: '请选择团队', trigger: 'change' }],
  title: [{ required: true, message: '请输入案例标题', trigger: 'blur' }],
  demoType: [{ required: true, message: '请选择拆除类型', trigger: 'change' }]
}

// 图片列表（用于展示）
const beforeImageList = ref([])
const afterImageList = ref([])

const fetchData = async () => {
  loading.value = true
  try {
    const data = await getCaseList(queryParams)
    tableData.value = data.list || []
    total.value = data.total || 0
  } catch (error) {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

const fetchTeamList = async () => {
  try {
    const data = await getAllTeams()
    teamList.value = data || []
  } catch (error) {
    // handled by interceptor
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.status = undefined
  queryParams.teamId = ''
  queryParams.demoType = undefined
  queryParams.page = 1
  fetchData()
}

const resetForm = () => {
  formData.teamId = ''
  formData.title = ''
  formData.demoType = undefined
  formData.description = ''
  formData.address = ''
  formData.area = null
  formData.duration = null
  formData.beforeImageIds = []
  formData.afterImageIds = []
  formData.status = 1
  formData.recommended = false
  beforeImageList.value = []
  afterImageList.value = []
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  formVisible.value = true
}

const handleRowClick = (row) => {
  // 单击行可以打开编辑
}

const handleEdit = (row) => {
  isEdit.value = true
  currentRow.value = row
  Object.assign(formData, {
    teamId: row.teamId || '',
    title: row.title || '',
    demoType: row.demoType,
    description: row.description || '',
    address: row.address || '',
    area: row.area ? Number(row.area) : null,
    duration: row.duration || null,
    beforeImageIds: row.beforeImageIds || [],
    afterImageIds: row.afterImageIds || [],
    status: row.status,
    recommended: row.recommended || false
  })
  // 构建图片列表用于展示
  beforeImageList.value = (row.beforeImageUrls || []).map((url, index) => ({
    id: row.beforeImageIds?.[index] || url,
    url: url,
    name: `before_${index + 1}`
  }))
  afterImageList.value = (row.afterImageUrls || []).map((url, index) => ({
    id: row.afterImageIds?.[index] || url,
    url: url,
    name: `after_${index + 1}`
  }))
  formVisible.value = true
}

const beforeImageUpload = (file) => {
  const isImage = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传 JPG/PNG/WEBP 图片')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  return true
}

const handleImageUpload = async ({ file }, type) => {
  try {
    const res = await uploadFile(file)
    if (type === 'before') {
      formData.beforeImageIds.push(res.id)
      beforeImageList.value.push({
        id: res.id,
        url: res.fileUrl,
        name: file.name
      })
    } else {
      formData.afterImageIds.push(res.id)
      afterImageList.value.push({
        id: res.id,
        url: res.fileUrl,
        name: file.name
      })
    }
    ElMessage.success('图片上传成功')
  } catch (error) {
    // handled by interceptor
  }
}

const handleImageRemove = (file, fileList, type) => {
  const fileId = file.id || file.response?.id
  if (!fileId) return

  if (type === 'before') {
    formData.beforeImageIds = formData.beforeImageIds.filter(id => id !== fileId)
    beforeImageList.value = fileList
  } else {
    formData.afterImageIds = formData.afterImageIds.filter(id => id !== fileId)
    afterImageList.value = fileList
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    formLoading.value = true
    try {
      if (isEdit.value) {
        await updateCase(currentRow.value.id, formData)
        ElMessage.success('更新成功')
      } else {
        await createCase(formData)
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

const handleVisible = async (row) => {
  try {
    await ElMessageBox.confirm('确定显示该案例？显示后用户可见。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    await updateCaseStatus(row.id, { action: 'visible' })
    ElMessage.success('已显示')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      // handled by interceptor
    }
  }
}

const handleHidden = async (row) => {
  try {
    await ElMessageBox.confirm('确定隐藏该案例？隐藏后用户不可见。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await updateCaseStatus(row.id, { action: 'hidden' })
    ElMessage.success('已隐藏')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      // handled by interceptor
    }
  }
}

const handleRecommend = async (row) => {
  try {
    await ElMessageBox.confirm('确定推荐该案例？推荐后将在首页展示。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    await updateCase(row.id, { recommended: true })
    ElMessage.success('已推荐')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      // handled by interceptor
    }
  }
}

const handleUnrecommend = async (row) => {
  try {
    await ElMessageBox.confirm('确定取消推荐该案例？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    await updateCase(row.id, { recommended: false })
    ElMessage.success('已取消推荐')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      // handled by interceptor
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该案例？删除后不可见。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await updateCaseStatus(row.id, { action: 'hidden' })
    ElMessage.success('已删除')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      // handled by interceptor
    }
  }
}

onMounted(() => {
  fetchData()
  fetchTeamList()
})
</script>

<style scoped>
.image-upload-wrapper {
  width: 100%;
}
.image-uploader {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
