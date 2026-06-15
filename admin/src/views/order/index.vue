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
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewDetail(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 0"
              type="success"
              link
              size="small"
              @click="handleApprove(row)"
            >
              审核
            </el-button>
            <el-button
              v-if="row.status === 2 && row.contractStatus === 1"
              type="warning"
              link
              size="small"
              @click="handleApproveContract(row)"
            >
              审核合同
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
    <el-drawer v-model="detailVisible" title="订单详情" size="600px">
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
        <!-- 合同信息 -->
        <el-descriptions-item label="合同状态">
          <el-tag :type="getContractStatusType(currentRow.contractStatus)">
            {{ getContractStatusText(currentRow.contractStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="合同文件" v-if="currentRow.contractId">
          <el-button type="primary" link size="small" @click="viewContract(currentRow.contractId)">
            查看合同
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item label="计划开工日期">{{ currentRow.planStartDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="签约时间">{{ currentRow.signedAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentRow.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentRow.updatedAt || '-' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 合同审核操作 -->
      <div class="contract-action" v-if="currentRow.status === 2 && currentRow.contractStatus === 1">
        <el-divider />
        <div class="action-title">合同待审核</div>
        <el-button type="warning" @click="handleApproveContract(currentRow)">
          审核合同
        </el-button>
      </div>
    </el-drawer>

    <!-- 订单审核对话框 -->
    <el-dialog v-model="approveVisible" title="订单审核" width="500px">
      <el-form :model="approveForm" label-width="80px">
        <el-form-item label="订单编号">
          <span>{{ currentRow?.orderNo }}</span>
        </el-form-item>
        <el-form-item label="需求标题">
          <span>{{ currentRow?.demandTitle }}</span>
        </el-form-item>
        <el-form-item label="施工团队">
          <span>{{ currentRow?.teamName }}</span>
        </el-form-item>
        <el-form-item label="成交价格">
          <span style="color: #E6A23C; font-weight: 600">{{ currentRow?.finalPrice?.toLocaleString() }} 元</span>
        </el-form-item>
        <el-form-item label="审核操作" required>
          <el-radio-group v-model="approveForm.action">
            <el-radio value="passed">通过</el-radio>
            <el-radio value="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input
            v-model="approveForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入审核备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approveVisible = false">取消</el-button>
        <el-button type="primary" :loading="approveLoading" @click="submitApprove">确定</el-button>
      </template>
    </el-dialog>

    <!-- 合同审核对话框 -->
    <el-dialog v-model="contractVisible" title="合同审核" width="500px">
      <el-form label-width="80px">
        <el-form-item label="订单编号">
          <span>{{ currentRow?.orderNo }}</span>
        </el-form-item>
        <el-form-item label="施工团队">
          <span>{{ currentRow?.teamName }}</span>
        </el-form-item>
        <el-form-item label="计划开工">
          <span>{{ currentRow?.planStartDate || '-' }}</span>
        </el-form-item>
        <el-form-item label="审核操作" required>
          <el-radio-group v-model="contractForm.action">
            <el-radio value="passed">通过</el-radio>
            <el-radio value="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input
            v-model="contractForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入审核备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="contractVisible = false">取消</el-button>
        <el-button type="primary" :loading="contractLoading" @click="submitContract">确定</el-button>
      </template>
    </el-dialog>

    <!-- 合同图片预览对话框 -->
    <el-dialog v-model="contractPreviewVisible" title="合同预览" width="800px">
      <div class="contract-preview">
        <img :src="contractImageUrl" alt="合同图片" style="max-width: 100%;" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getOrderList, approveOrder, approveContract } from '@/api/order'
import service from '@/utils/request'
import { ORDER_STATUS, ORDER_STATUS_TAG_TYPE, CONTRACT_STATUS, CONTRACT_STATUS_TAG_TYPE } from '@/utils/constants'
import { ElMessage } from 'element-plus'

const CONTRACT_STATUS_NAME = {
  0: '待上传',
  1: '待审核',
  2: '已通过'
}

const getContractStatusType = (status) => CONTRACT_STATUS_TAG_TYPE[status] || 'info'
const getContractStatusText = (status) => CONTRACT_STATUS_NAME[status] || '未知'

// 查看合同文件
const viewContract = async (contractId) => {
  if (!contractId) return
  try {
    const data = await service.get(`/files/${contractId}`)
    if (data.fileUrl) {
      contractImageUrl.value = data.fileUrl
      contractPreviewVisible.value = true
    } else {
      ElMessage.warning('合同文件不存在')
    }
  } catch (error) {
    ElMessage.error('获取合同信息失败')
  }
}

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const detailVisible = ref(false)
const currentRow = ref(null)
const contractPreviewVisible = ref(false)
const contractImageUrl = ref('')

// 审核对话框相关
const approveVisible = ref(false)
const approveLoading = ref(false)
const approveForm = reactive({
  action: 'passed',
  remark: ''
})

// 合同审核对话框相关
const contractVisible = ref(false)
const contractLoading = ref(false)
const contractForm = reactive({
  action: 'passed',
  remark: ''
})

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

// 打开订单审核对话框
const handleApprove = (row) => {
  currentRow.value = row
  approveForm.action = 'passed'
  approveForm.remark = ''
  approveVisible.value = true
}

// 提交订单审核
const submitApprove = async () => {
  approveLoading.value = true
  try {
    await approveOrder(currentRow.value.id)
    ElMessage.success('审核完成')
    approveVisible.value = false
    fetchData()
  } catch (error) {
    // handled by interceptor
  } finally {
    approveLoading.value = false
  }
}

// 打开合同审核对话框
const handleApproveContract = (row) => {
  currentRow.value = row
  contractForm.action = 'passed'
  contractForm.remark = ''
  contractVisible.value = true
}

// 提交合同审核
const submitContract = async () => {
  contractLoading.value = true
  try {
    await approveContract(currentRow.value.id)
    ElMessage.success('合同审核完成')
    contractVisible.value = false
    fetchData()
  } catch (error) {
    // handled by interceptor
  } finally {
    contractLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.contract-action {
  padding: 16px;
}
.action-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
}
</style>
