<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="企业名称">
          <el-input v-model="queryParams.name" placeholder="请输入企业名称" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="queryParams.verifyStatus" placeholder="全部" clearable style="width: 120px">
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
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
        <el-table-column prop="name" label="企业名称" min-width="160" />
        <el-table-column prop="contactPerson" label="联系人" width="100" />
        <el-table-column prop="contactPhone" label="联系电话" width="130" />
        <el-table-column prop="verifyStatus" label="审核状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="VERIFY_STATUS_TAG_TYPE[row.verifyStatus]" size="small">
              {{ VERIFY_STATUS[row.verifyStatus] || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.verifyStatus === 0"
              type="primary"
              link
              size="small"
              @click="handleVerify(row)"
            >
              审核
            </el-button>
            <el-button type="primary" link size="small" @click="handleViewTeams(row)">
              团队
            </el-button>
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

    <!-- 审核对话框 -->
    <el-dialog v-model="verifyVisible" title="企业审核" width="500px">
      <el-form :model="verifyForm" label-width="80px">
        <el-form-item label="企业名称">
          <span>{{ currentRow?.name }}</span>
        </el-form-item>
        <el-form-item label="审核操作" required>
          <el-radio-group v-model="verifyForm.action">
            <el-radio value="passed">通过</el-radio>
            <el-radio value="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input
            v-model="verifyForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入审核备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="verifyVisible = false">取消</el-button>
        <el-button type="primary" :loading="verifyLoading" @click="submitVerify">确定</el-button>
      </template>
    </el-dialog>

    <!-- 团队列表对话框 -->
    <el-dialog v-model="teamsVisible" title="企业团队" width="700px">
      <el-table :data="teamList" v-loading="teamsLoading" stripe border size="small">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="团队名称" min-width="120" />
        <el-table-column prop="leaderAName" label="负责人" width="100" />
        <el-table-column prop="teamSize" label="团队人数" width="90" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailVisible" title="企业详情" size="500px">
      <el-descriptions :column="1" border v-if="currentRow">
        <el-descriptions-item label="ID">{{ currentRow.id }}</el-descriptions-item>
        <el-descriptions-item label="企业名称">{{ currentRow.name }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ currentRow.contactPerson }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentRow.contactPhone }}</el-descriptions-item>
        <el-descriptions-item label="营业执照号">{{ currentRow.licenseNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="VERIFY_STATUS_TAG_TYPE[currentRow.verifyStatus]">
            {{ VERIFY_STATUS[currentRow.verifyStatus] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentRow.createdAt }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getCompanyList, verifyCompany, getCompanyTeams } from '@/api/company'
import { VERIFY_STATUS, VERIFY_STATUS_TAG_TYPE } from '@/utils/constants'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const verifyVisible = ref(false)
const verifyLoading = ref(false)
const teamsVisible = ref(false)
const teamsLoading = ref(false)
const teamList = ref([])
const detailVisible = ref(false)
const currentRow = ref(null)

const queryParams = reactive({
  page: 1,
  pageSize: 20,
  name: '',
  verifyStatus: undefined
})

const verifyForm = reactive({
  action: 'passed',
  remark: ''
})

const fetchData = async () => {
  loading.value = true
  try {
    const data = await getCompanyList(queryParams)
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
  queryParams.name = ''
  queryParams.verifyStatus = undefined
  queryParams.page = 1
  fetchData()
}

const handleVerify = (row) => {
  currentRow.value = row
  verifyForm.action = 'passed'
  verifyForm.remark = ''
  verifyVisible.value = true
}

const submitVerify = async () => {
  verifyLoading.value = true
  try {
    await verifyCompany(currentRow.value.id, verifyForm)
    ElMessage.success('审核完成')
    verifyVisible.value = false
    fetchData()
  } catch (error) {
    // handled by interceptor
  } finally {
    verifyLoading.value = false
  }
}

const handleViewTeams = async (row) => {
  currentRow.value = row
  teamsVisible.value = true
  teamsLoading.value = true
  try {
    const data = await getCompanyTeams(row.id, { page: 1, pageSize: 100 })
    teamList.value = data.list || []
  } catch (error) {
    // handled by interceptor
  } finally {
    teamsLoading.value = false
  }
}

const handleViewDetail = (row) => {
  currentRow.value = row
  detailVisible.value = true
}

onMounted(() => {
  fetchData()
})
</script>
