<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
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
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never" class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="teamName" label="施工团队" min-width="120" />
        <el-table-column prop="demoType" label="拆除类型" width="110">
          <template #default="{ row }">
            {{ DEMO_TYPES[row.demoType] || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="area" label="面积(m²)" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="VERIFY_STATUS_TAG_TYPE[row.status]" size="small">
              {{ VERIFY_STATUS[row.status] || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="80" align="center" />
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              type="success"
              link
              size="small"
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 0"
              type="danger"
              link
              size="small"
              @click="handleReject(row)"
            >
              拒绝
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getCaseList, updateCaseStatus } from '@/api/case'
import { DEMO_TYPES, VERIFY_STATUS, VERIFY_STATUS_TAG_TYPE } from '@/utils/constants'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  pageSize: 20,
  status: undefined,
  teamId: '',
  demoType: undefined
})

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

const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm('确定通过该案例审核？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await updateCaseStatus(row.id, { action: 'passed' })
    ElMessage.success('审核通过')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      // handled by interceptor
    }
  }
}

const handleReject = async (row) => {
  try {
    await ElMessageBox.confirm('确定拒绝该案例？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await updateCaseStatus(row.id, { action: 'rejected' })
    ElMessage.success('已拒绝')
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
