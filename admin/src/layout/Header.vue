<template>
  <el-header class="header-container">
    <div class="header-left">
      <el-icon
        class="collapse-btn"
        :size="20"
        @click="$emit('toggle-sidebar')"
      >
        <Fold v-if="!isCollapse" />
        <Expand v-else />
      </el-icon>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentTitle">{{ currentTitle }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header-right">
      <el-dropdown trigger="click" @command="handleCommand">
        <span class="admin-info">
          <el-icon><UserFilled /></el-icon>
          <span class="admin-name">{{ username }}</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'

defineProps({
  isCollapse: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-sidebar'])

const route = useRoute()
const userStore = useUserStore()

const currentTitle = computed(() => route.meta.title || '')
const username = computed(() => userStore.username || '管理员')

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
  }
}
</script>

<style lang="scss" scoped>
.header-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  cursor: pointer;
  color: #606266;
  &:hover {
    color: #409EFF;
  }
}

.header-right {
  display: flex;
  align-items: center;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;

  &:hover {
    color: #409EFF;
  }
}

.admin-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
