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
        <el-table-column prop="companyName" label="所属企业" min-width="140">
          <template #default="{ row }">
            {{ row.companyName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="队长" width="140">
          <template #default="{ row }">
            <span v-if="row.leaderName || row.leaderNames" style="color: #303133;">
              {{ row.leaderName || row.leaderNames }}
            </span>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="teamSize" label="团队规模" width="90" align="center" />
        <el-table-column prop="specialties" label="擅长类型" min-width="140" show-overflow-tooltip />
        <el-table-column prop="memberCount" label="成员数" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.memberCount > 0 ? 'success' : 'info'" size="small">
              {{ row.memberCount }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="推荐" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.recommended" type="warning" size="small">推荐</el-tag>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleManageMembers(row)">成员管理</el-button>
            <el-button
              :type="row.recommended ? 'warning' : 'default'"
              link
              size="small"
              @click="handleRecommendedChange(row)"
            >
              {{ row.recommended ? '取消推荐' : '设为推荐' }}
            </el-button>
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

    <!-- 成员管理抽屉 -->
    <el-drawer
      v-model="memberDrawerVisible"
      :title="`${currentTeam.name || '团队'} - 成员管理`"
      size="600px"
    >
      <div v-if="currentTeam.id" class="member-drawer">
        <div class="member-header">
          <el-descriptions :column="2" border size="small" style="margin-bottom: 16px;">
            <el-descriptions-item label="团队名称">{{ currentTeam.name }}</el-descriptions-item>
            <el-descriptions-item label="所属企业">{{ currentTeam.companyName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="团队成员数">
              <el-tag type="success" size="small">{{ memberList.length }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="队长数">
              <el-tag type="warning" size="small">
                {{ memberList.filter(m => m.isTeamAdmin).length }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <el-table :data="memberList" v-loading="memberLoading" stripe border size="small">
          <el-table-column prop="id" label="ID" width="70" align="center" />
          <el-table-column prop="nickname" label="昵称" min-width="120" />
          <el-table-column prop="phone" label="手机号" width="130" />
          <el-table-column prop="isTeamAdmin" label="队长" width="80" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.isTeamAdmin" type="warning" size="small">队长</el-tag>
              <span v-else style="color: #909399;">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="用户状态" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
                {{ row.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="加入时间" width="170" />
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="!row.isTeamAdmin"
                type="warning"
                link
                size="small"
                @click="handleSetLeader(row, true)"
              >设为队长</el-button>
              <el-button
                v-else
                type="info"
                link
                size="small"
                @click="handleSetLeader(row, false)"
              >取消队长</el-button>
              <el-popconfirm
                title="确定要将该成员移出团队吗？"
                confirm-button-text="确定"
                cancel-button-text="取消"
                @confirm="handleRemoveMember(row)"
              >
                <template #reference>
                  <el-button type="danger" link size="small">移除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <el-empty
          v-if="!memberLoading && memberList.length === 0"
          description="该团队暂无成员，请前往用户管理页面关联成员"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getTeamList, updateTeamStatus, getTeamMembers, setTeamLeader, removeTeamMember, setTeamRecommended } from '@/api/team'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const memberLoading = ref(false)
const tableData = ref([])
const total = ref(0)
const memberDrawerVisible = ref(false)
const memberList = ref([])
const currentTeam = reactive({
  id: null,
  name: '',
  companyName: ''
})

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
    const list = data.list || []
    tableData.value = list.map(item => ({
      ...item,
      memberCount: item.memberCount || 0
    }))
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

const handleRecommendedChange = async (row) => {
  const action = row.recommended ? '取消推荐' : '设为推荐'
  try {
    await ElMessageBox.confirm(`确定要${action}该团队吗？${row.recommended ? '' : '推荐后将在小程序首页展示。'}`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await setTeamRecommended(row.id, !row.recommended)
    ElMessage.success(`${action}成功`)
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      // handled by interceptor
    }
  }
}

const handleManageMembers = async (row) => {
  currentTeam.id = row.id
  currentTeam.name = row.name
  currentTeam.companyName = row.companyName || '-'
  memberDrawerVisible.value = true
  await fetchTeamMembers(row.id)
}

const fetchTeamMembers = async (teamId) => {
  memberLoading.value = true
  try {
    const data = await getTeamMembers(teamId)
    const members = data.members || []
    memberList.value = members.map(m => ({
      ...m,
      nickname: m.nickname || m.phone || '未设置昵称'
    }))
  } catch (error) {
    // handled by interceptor
  } finally {
    memberLoading.value = false
  }
}

const handleSetLeader = async (row, isLeader) => {
  try {
    const actionText = isLeader ? '设为队长' : '取消队长'
    await ElMessageBox.confirm(`确定要${actionText}吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await setTeamLeader(currentTeam.id, row.id, isLeader)
    ElMessage.success('操作成功')
    fetchTeamMembers(currentTeam.id)
  } catch (error) {
    if (error !== 'cancel') {
      // handled by interceptor
    }
  }
}

const handleRemoveMember = async (row) => {
  try {
    await removeTeamMember(currentTeam.id, row.id)
    ElMessage.success('已移除团队成员')
    fetchTeamMembers(currentTeam.id)
    fetchData()
  } catch (error) {
    // handled by interceptor
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.member-drawer {
  padding: 10px 0;
}

.member-header {
  margin-bottom: 16px;
}
</style>
