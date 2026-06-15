<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="角色">
          <el-select v-model="queryParams.role" placeholder="全部" clearable style="width: 120px">
            <el-option label="需求方" :value="1" />
            <el-option label="服务方" :value="2" />
            <el-option label="运营" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 100px">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="queryParams.phone" placeholder="请输入手机号" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="queryParams.nickname" placeholder="请输入昵称" clearable style="width: 140px" />
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
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="roles" label="已分配角色" width="180" align="center">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role"
              :type="getRoleTagType(role)"
              size="small"
              style="margin-right: 4px;"
            >
              {{ ROLE_MAP[role] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="teamName" label="所属团队" min-width="160">
          <template #default="{ row }">
            <span v-if="row.team && row.team.name" style="color: #303133;">
              {{ row.team.name }}
              <el-tag v-if="row.isTeamAdmin" type="warning" size="small" style="margin-left: 4px;">队长</el-tag>
            </span>
            <span v-else style="color: #909399;">未关联</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              @change="(val) => handleStatusChange(row, val)"
              inline-prompt
              active-text="正常"
              inactive-text="禁用"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="170" />
        <el-table-column label="操作" width="230" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewDetail(row)">详情</el-button>
            <el-button type="warning" link size="small" @click="handleAssignRoles(row)">分配角色</el-button>
            <el-button type="success" link size="small" @click="handleAssignTeam(row)">关联团队</el-button>
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
    <el-drawer v-model="detailVisible" title="用户详情" size="500px">
      <el-descriptions :column="1" border v-if="currentRow">
        <el-descriptions-item label="ID">{{ currentRow.id }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentRow.nickname }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentRow.phone }}</el-descriptions-item>
        <el-descriptions-item label="已分配角色">
          <el-tag
            v-for="role in currentRow.roles"
            :key="role"
            :type="getRoleTagType(role)"
            size="small"
            style="margin-right: 4px;"
          >
            {{ ROLE_MAP[role] || '未知' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="当前角色">
          <el-tag :type="getRoleTagType(currentRow.currentRole)" size="small">
            {{ ROLE_MAP[currentRow.currentRole] || '未知' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="所属团队">
          <span v-if="currentRow.team && currentRow.team.name">
            {{ currentRow.team.name }}
            <el-tag v-if="currentRow.isTeamAdmin" type="warning" size="small" style="margin-left: 4px;">队长</el-tag>
          </span>
          <span v-else style="color: #909399;">未关联</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentRow.status === 1 ? 'success' : 'danger'" size="small">
            {{ STATUS_MAP[currentRow.status] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentRow.createdAt }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>

    <!-- 分配角色对话框 -->
    <el-dialog v-model="assignDialogVisible" title="分配角色" width="400px">
      <el-form :model="assignForm" label-width="80px">
        <el-form-item label="用户">
          <span>{{ assignForm.nickname }}</span>
        </el-form-item>
        <el-form-item label="分配角色">
          <el-checkbox-group v-model="assignForm.roles">
            <el-checkbox :label="1">需求方</el-checkbox>
            <el-checkbox :label="2">服务方</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item>
          <div class="tip-text">
            <el-icon><InfoFilled /></el-icon>
            提示：需求方角色不可移除，所有用户必须拥有需求方角色
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssignRoles" :loading="assignLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 关联团队对话框 -->
    <el-dialog v-model="teamDialogVisible" title="关联团队" width="450px">
      <el-form :model="teamForm" label-width="80px">
        <el-form-item label="用户">
          <span>{{ teamForm.nickname || '-' }}</span>
        </el-form-item>
        <el-form-item label="所属团队" required>
          <el-select
            v-model="teamForm.teamId"
            placeholder="请选择团队（留空则取消关联）"
            clearable
            filterable
            style="width: 100%;"
          >
            <el-option
              v-for="team in allTeams"
              :key="team.id"
              :label="`${team.name}（${team.companyName || '未关联企业'}）`"
              :value="team.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <div class="tip-text">
            <el-icon><InfoFilled /></el-icon>
            提示：清空选择即为取消团队关联
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="teamDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssignTeam" :loading="teamLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getUserList, updateUserStatus, assignUserRoles, assignUserTeam } from '@/api/user'
import { getAllTeams } from '@/api/team'
import { ROLE_MAP, STATUS_MAP } from '@/utils/constants'
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

const loading = ref(false)
const assignLoading = ref(false)
const teamLoading = ref(false)
const tableData = ref([])
const total = ref(0)
const detailVisible = ref(false)
const currentRow = ref(null)
const assignDialogVisible = ref(false)
const teamDialogVisible = ref(false)
const allTeams = ref([])

const assignForm = reactive({
  id: null,
  nickname: '',
  roles: [1]
})

const teamForm = reactive({
  id: null,
  nickname: '',
  teamId: ''
})

const queryParams = reactive({
  page: 1,
  pageSize: 20,
  role: undefined,
  status: undefined,
  phone: '',
  nickname: ''
})

const fetchData = async () => {
  loading.value = true
  try {
    const data = await getUserList(queryParams)
    tableData.value = data.list || []
    total.value = data.total || 0
  } catch (error) {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

const fetchTeams = async () => {
  try {
    const teams = await getAllTeams()
    allTeams.value = Array.isArray(teams) ? teams : (teams.list || [])
  } catch (error) {
    // handled by interceptor
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.role = undefined
  queryParams.status = undefined
  queryParams.phone = ''
  queryParams.nickname = ''
  queryParams.page = 1
  fetchData()
}

const handleStatusChange = async (row, val) => {
  const newStatus = val ? 1 : 0
  const action = val ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定要${action}该用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await updateUserStatus(row.id, { status: newStatus })
    ElMessage.success(`${action}成功`)
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      // handled by interceptor
    }
  }
}

const handleViewDetail = (row) => {
  currentRow.value = row
  detailVisible.value = true
}

const getRoleTagType = (role) => {
  const typeMap = {
    1: '',        // default - 需求方
    2: 'success', // green - 服务方
    3: 'warning'  // orange - 平台运营
  }
  return typeMap[role] || ''
}

const handleAssignRoles = (row) => {
  assignForm.id = row.id
  assignForm.nickname = row.nickname
  assignForm.roles = [...(row.roles || [1])]
  assignDialogVisible.value = true
}

const submitAssignRoles = async () => {
  if (!assignForm.roles.includes(1)) {
    ElMessage.warning('需求方角色不可移除，已自动添加')
    assignForm.roles.push(1)
  }

  assignLoading.value = true
  try {
    await assignUserRoles(assignForm.id, assignForm.roles)
    ElMessage.success('角色分配成功')
    assignDialogVisible.value = false
    fetchData()
  } catch (error) {
    // handled by interceptor
  } finally {
    assignLoading.value = false
  }
}

const handleAssignTeam = async (row) => {
  if (allTeams.value.length === 0) {
    await fetchTeams()
  }
  teamForm.id = row.id
  teamForm.nickname = row.nickname
  teamForm.teamId = row.teamId || ''
  teamDialogVisible.value = true
}

const submitAssignTeam = async () => {
  teamLoading.value = true
  try {
    await assignUserTeam(teamForm.id, teamForm.teamId || '')
    if (teamForm.teamId && teamForm.teamId.trim() !== '') {
      ElMessage.success('团队关联成功')
    } else {
      ElMessage.success('已取消团队关联')
    }
    teamDialogVisible.value = false
    fetchData()
  } catch (error) {
    // handled by interceptor
  } finally {
    teamLoading.value = false
  }
}

onMounted(() => {
  fetchData()
  fetchTeams()
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

.tip-text {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 12px;
}
</style>
