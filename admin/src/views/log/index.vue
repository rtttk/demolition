<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="订单ID">
          <el-input v-model="queryParams.orderId" placeholder="请输入订单ID" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="团队ID">
          <el-input v-model="queryParams.teamId" placeholder="请输入团队ID" clearable style="width: 120px" />
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
        <el-table-column prop="orderId" label="订单ID" width="80" align="center" />
        <el-table-column prop="teamName" label="施工团队" min-width="120" />
        <el-table-column prop="logDate" label="日志日期" width="120" />
        <el-table-column prop="content" label="日志内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="progress" label="进度(%)" width="90" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress || 0"
              :stroke-width="14"
              :text-inside="true"
              :status="row.progress >= 100 ? 'success' : ''"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="记录时间" width="170" />
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
import { getLogList } from '@/api/log'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  pageSize: 20,
  orderId: '',
  teamId: ''
})

const fetchData = async () => {
  loading.value = true
  try {
    const data = await getLogList(queryParams)
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
  queryParams.orderId = ''
  queryParams.teamId = ''
  queryParams.page = 1
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>
