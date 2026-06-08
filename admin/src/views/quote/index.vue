<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option
              v-for="(label, value) in QUOTE_STATUS"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="需求ID">
          <el-input v-model="queryParams.demandId" placeholder="请输入需求ID" clearable style="width: 120px" />
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
        <el-table-column prop="demandTitle" label="需求标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="teamName" label="报价团队" min-width="120" />
        <el-table-column prop="price" label="报价金额(元)" width="120" align="right">
          <template #default="{ row }">
            <span style="color: #E6A23C; font-weight: 600">{{ row.price?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="工期(天)" width="90" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="QUOTE_STATUS_TAG_TYPE[row.status]" size="small">
              {{ QUOTE_STATUS[row.status] || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              type="primary"
              link
              size="small"
              @click="handleReview(row)"
            >
              审核
            </el-button>
            <span v-else class="text-muted">已处理</span>
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

    <!-- 审核对话框 -->
    <el-dialog v-model="reviewVisible" title="报价审核" width="500px">
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="需求标题">
          <span>{{ currentRow?.demandTitle }}</span>
        </el-form-item>
        <el-form-item label="报价团队">
          <span>{{ currentRow?.teamName }}</span>
        </el-form-item>
        <el-form-item label="报价金额">
          <span style="color: #E6A23C; font-weight: 600">{{ currentRow?.price?.toLocaleString() }} 元</span>
        </el-form-item>
        <el-form-item label="审核操作" required>
          <el-radio-group v-model="reviewForm.action">
            <el-radio value="passed">通过</el-radio>
            <el-radio value="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input
            v-model="reviewForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入审核备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewVisible = false">取消</el-button>
        <el-button type="primary" :loading="reviewLoading" @click="submitReview">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getQuoteList, reviewQuote } from '@/api/quote'
import { QUOTE_STATUS, QUOTE_STATUS_TAG_TYPE } from '@/utils/constants'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const reviewVisible = ref(false)
const reviewLoading = ref(false)
const currentRow = ref(null)

const queryParams = reactive({
  page: 1,
  pageSize: 20,
  status: undefined,
  demandId: '',
  teamId: ''
})

const reviewForm = reactive({
  action: 'passed',
  remark: ''
})

const fetchData = async () => {
  loading.value = true
  try {
    const data = await getQuoteList(queryParams)
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
  queryParams.demandId = ''
  queryParams.teamId = ''
  queryParams.page = 1
  fetchData()
}

const handleReview = (row) => {
  currentRow.value = row
  reviewForm.action = 'passed'
  reviewForm.remark = ''
  reviewVisible.value = true
}

const submitReview = async () => {
  reviewLoading.value = true
  try {
    await reviewQuote(currentRow.value.id, reviewForm)
    ElMessage.success('审核完成')
    reviewVisible.value = false
    fetchData()
  } catch (error) {
    // handled by interceptor
  } finally {
    reviewLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.text-muted {
  color: #909399;
  font-size: 12px;
}
</style>
