<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-title">用户总数</div>
              <div class="stat-value">{{ stats.userCount || 0 }}</div>
            </div>
            <el-icon :size="48" class="stat-icon" style="color: #409EFF"><User /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-title">需求总数</div>
              <div class="stat-value">{{ stats.demandCount || 0 }}</div>
            </div>
            <el-icon :size="48" class="stat-icon" style="color: #67C23A"><Document /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-title">订单总数</div>
              <div class="stat-value">{{ stats.orderCount || 0 }}</div>
            </div>
            <el-icon :size="48" class="stat-icon" style="color: #E6A23C"><List /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-title">案例总数</div>
              <div class="stat-value">{{ stats.caseCount || 0 }}</div>
            </div>
            <el-icon :size="48" class="stat-icon" style="color: #F56C6C"><Picture /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最新需求和最新订单 -->
    <el-row :gutter="20" class="table-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">最新需求</span>
          </template>
          <el-table :data="recentDemands" stripe size="small" style="width: 100%">
            <el-table-column prop="demandNo" label="需求编号" width="120" />
            <el-table-column prop="title" label="标题" show-overflow-tooltip />
            <el-table-column prop="demoType" label="类型" width="100">
              <template #default="{ row }">
                {{ DEMO_TYPES[row.demoType] || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="DEMAND_STATUS_TAG_TYPE[row.status]" size="small">
                  {{ DEMAND_STATUS[row.status] || '-' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">最新订单</span>
          </template>
          <el-table :data="recentOrders" stripe size="small" style="width: 100%">
            <el-table-column prop="orderNo" label="订单编号" width="120" />
            <el-table-column prop="demandTitle" label="需求标题" show-overflow-tooltip />
            <el-table-column prop="teamName" label="施工团队" width="100" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="ORDER_STATUS_TAG_TYPE[row.status]" size="small">
                  {{ ORDER_STATUS[row.status] || '-' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDashboard } from '@/api/dashboard'
import {
  DEMO_TYPES,
  DEMAND_STATUS,
  ORDER_STATUS,
  DEMAND_STATUS_TAG_TYPE,
  ORDER_STATUS_TAG_TYPE
} from '@/utils/constants'

const stats = ref({})
const recentDemands = ref([])
const recentOrders = ref([])

const fetchDashboard = async () => {
  try {
    const data = await getDashboard()
    stats.value = data.stats || {}
    recentDemands.value = data.recentDemands || []
    recentOrders.value = data.recentOrders || []
  } catch (error) {
    // Error handled by interceptor
  }
}

onMounted(() => {
  fetchDashboard()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  .stat-row {
    margin-bottom: 20px;
  }

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .stat-info {
      .stat-title {
        font-size: 14px;
        color: #909399;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #303133;
      }
    }

    .stat-icon {
      opacity: 0.8;
    }
  }

  .table-row {
    .card-title {
      font-size: 16px;
      font-weight: 600;
    }
  }
}
</style>
