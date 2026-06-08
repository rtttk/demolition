<template>
  <el-aside :width="isCollapse ? '64px' : '240px'" class="sidebar-container">
    <div class="logo-container">
      <el-icon :size="28" color="#409EFF"><OfficeBuilding /></el-icon>
      <span v-show="!isCollapse" class="logo-title">拆除服务平台</span>
    </div>
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapse"
      :collapse-transition="false"
      router
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
    >
      <el-menu-item index="/dashboard">
        <el-icon><DataAnalysis /></el-icon>
        <template #title>数据看板</template>
      </el-menu-item>
      <el-menu-item index="/user">
        <el-icon><User /></el-icon>
        <template #title>用户管理</template>
      </el-menu-item>
      <el-menu-item index="/company">
        <el-icon><OfficeBuilding /></el-icon>
        <template #title>企业管理</template>
      </el-menu-item>
      <el-menu-item index="/team">
        <el-icon><UserFilled /></el-icon>
        <template #title>团队管理</template>
      </el-menu-item>
      <el-menu-item index="/demand">
        <el-icon><Document /></el-icon>
        <template #title>需求管理</template>
      </el-menu-item>
      <el-menu-item index="/quote">
        <el-icon><Money /></el-icon>
        <template #title>报价管理</template>
      </el-menu-item>
      <el-menu-item index="/order">
        <el-icon><List /></el-icon>
        <template #title>订单管理</template>
      </el-menu-item>
      <el-menu-item index="/case">
        <el-icon><Picture /></el-icon>
        <template #title>案例管理</template>
      </el-menu-item>
      <el-menu-item index="/compliance">
        <el-icon><Reading /></el-icon>
        <template #title>合规管理</template>
      </el-menu-item>
      <el-menu-item index="/log">
        <el-icon><Notebook /></el-icon>
        <template #title>施工日志</template>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineProps({
  isCollapse: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style lang="scss" scoped>
.sidebar-container {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-title {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.el-menu {
  border-right: none;
}
</style>
