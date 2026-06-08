<template>
  <el-container class="layout-container">
    <Sidebar :is-collapse="isCollapse" />
    <el-container class="main-container">
      <Header :is-collapse="isCollapse" @toggle-sidebar="toggleSidebar" />
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'

const isCollapse = ref(false)

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  width: 100%;
}

.main-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
