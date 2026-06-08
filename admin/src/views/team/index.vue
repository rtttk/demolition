<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="企业ID">
          <el-input v-model="queryParams.companyId" placeholder="请输入企业ID" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="团队名称">
          <el-input v-model="queryParams.name" placeholder="请输入团队名称" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 100px">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
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
        <el-table-column prop="name" label="团队名称" min-width="140" />
        <el-table-column prop="companyName" label="所属企业" min-width="140" />
        <el-table-column prop="leaderName" label="负责人" width="100" />
        <el-table-column prop="teamSize" label="团队人数" width="90" align="center" />
        <el-table-column prop="specialties" label="擅长类型" min-width="140" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              @change="(val) => handleStatusChange(row, val)"
              inline-prompt
              active-text="启用"
              inactive-text="禁用"
            />
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
import { getTeamList, updateTeamStatus } from '@/api/team'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  pageSize: 20,
  companyId: '',
  name: '',
  status: undefined
})

const fetchData = async () => {
  loading.value = true
  try {
    const data = await getTeamList(queryParams)
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
  queryParams.companyId = ''
  queryParams.name = ''
  queryParams.status = undefined
  queryParams.page = 1
  fetchData()
}

const handleStatusChange = async (row, val) => {
  const newStatus = val ? 1 : 0
  const action = val ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定要${action}该团队吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await updateTeamStatus(row.id, { status: newStatus })
    ElMessage.success(`${action}成功`)
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
