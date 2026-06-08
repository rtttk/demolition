<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option
              v-for="(label, value) in DEMAND_STATUS"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="区域">
          <el-input v-model="queryParams.district" placeholder="请输入区域" clearable style="width: 140px" />
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
        <el-table-column prop="demandNo" label="需求编号" width="140" />
        <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="demoType" label="拆除类型" width="110">
          <template #default="{ row }">
            {{ DEMO_TYPES[row.demoType] || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="district" label="区域" width="100" />
        <el-table-column prop="area" label="面积(m²)" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="DEMAND_STATUS_TAG_TYPE[row.status]" size="small">
              {{ DEMAND_STATUS[row.status] || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quoteCount" label="报价数" width="80" align="center" />
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleUpdateStatus(row)">
              更新状态
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

    <!-- 更新状态对话框 -->
    <el-dialog v-model="statusVisible" title="更新需求状态" width="450px">
      <el-form :model="statusForm" label-width="80px">
        <el-form-item label="需求编号">
          <span>{{ currentRow?.demandNo }}</span>
        </el-form-item>
        <el-form-item label="当前状态">
          <el-tag :type="DEMAND_STATUS_TAG_TYPE[currentRow?.status]">
            {{ DEMAND_STATUS[currentRow?.status] }}
          </el-tag>
        </el-form-item>
        <el-form-item label="新状态" required>
          <el-select v-model="statusForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option
              v-for="(label, value) in DEMAND_STATUS"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusVisible = false">取消</el-button>
        <el-button type="primary" :loading="statusLoading" @click="submitStatus">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getDemandList, updateDemandStatus } from '@/api/demand'
import {
  DEMO_TYPES,
  DEMAND_STATUS,
  DEMAND_STATUS_TAG_TYPE
} from '@/utils/constants'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const statusVisible = ref(false)
const statusLoading = ref(false)
const currentRow = ref(null)

const queryParams = reactive({
  page: 1,
  pageSize: 20,
  status: undefined,
  district: '',
  demoType: undefined
})

const statusForm = reactive({
  status: undefined
})

const fetchData = async () => {
  loading.value = true
  try {
    const data = await getDemandList(queryParams)
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
  queryParams.district = ''
  queryParams.demoType = undefined
  queryParams.page = 1
  fetchData()
}

const handleUpdateStatus = (row) => {
  currentRow.value = row
  statusForm.status = row.status
  statusVisible.value = true
}

const submitStatus = async () => {
  if (statusForm.status === undefined) {
    ElMessage.warning('请选择状态')
    return
  }
  statusLoading.value = true
  try {
    await updateDemandStatus(currentRow.value.id, { status: statusForm.status })
    ElMessage.success('状态更新成功')
    statusVisible.value = false
    fetchData()
  } catch (error) {
    // handled by interceptor
  } finally {
    statusLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
