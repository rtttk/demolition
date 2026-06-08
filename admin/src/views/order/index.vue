<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option
              v-for="(label, value) in ORDER_STATUS"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="团队ID">
          <el-input v-model="queryParams.teamId" placeholder="请输入团队ID" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="企业ID">
          <el-input v-model="queryParams.companyId" placeholder="请输入企业ID" clearable style="width: 120px" />
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
        <el-table-column prop="orderNo" label="订单编号" width="160" />
        <el-table-column prop="demandTitle" label="需求标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="teamName" label="施工团队" min-width="120" />
        <el-table-column prop="finalPrice" label="成交价(元)" width="120" align="right">
          <template #default="{ row }">
            <span style="color: #E6A23C; font-weight: 600">{{ row.finalPrice?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="ORDER_STATUS_TAG_TYPE[row.status]" size="small">
              {{ ORDER_STATUS[row.status] || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewDetail(row)">
              详情
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

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailVisible" title="订单详情" size="550px">
      <el-descriptions :column="1" border v-if="currentRow">
        <el-descriptions-item label="订单编号">{{ currentRow.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="需求标题">{{ currentRow.demandTitle }}</el-descriptions-item>
        <el-descriptions-item label="施工团队">{{ currentRow.teamName }}</el-descriptions-item>
        <el-descriptions-item label="所属企业">{{ currentRow.companyName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="成交价格">{{ currentRow.finalPrice?.toLocaleString() }} 元</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="ORDER_STATUS_TAG_TYPE[currentRow.status]">
            {{ ORDER_STATUS[currentRow.status] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentRow.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentRow.updatedAt || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getOrderList } from '@/api/order'
import { ORDER_STATUS, ORDER_STATUS_TAG_TYPE } from '@/utils/constants'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const detailVisible = ref(false)
const currentRow = ref(null)

const queryParams = reactive({
  page: 1,
  pageSize: 20,
  status: undefined,
  teamId: '',
  companyId: ''
})

const fetchData = async () => {
  loading.value = true
  try {
    const data = await getOrderList(queryParams)
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
  queryParams.companyId = ''
  queryParams.page = 1
  fetchData()
}

const handleViewDetail = (row) => {
  currentRow.value = row
  detailVisible.value = true
}

onMounted(() => {
  fetchData()
})
</script>
