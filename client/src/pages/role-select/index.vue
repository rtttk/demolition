<template>
  <view class="role-select-page">
    <!-- 顶部说明 -->
    <view class="header-section">
      <text class="header-title">选择您的身份</text>
      <text class="header-desc">请选择您在平台中的主要角色</text>
    </view>

    <!-- 角色卡片（仅显示用户已分配的角色） -->
    <view class="role-cards">
      <view
        v-for="role in availableRoles"
        :key="role.value"
        class="role-card"
        :class="{ active: selectedRole === role.value }"
        @click="selectRole(role.value)"
      >
        <view class="role-icon" :class="role.value === 1 ? 'role-icon--demander' : 'role-icon--provider'">
          <text class="icon-text">{{ role.icon }}</text>
        </view>
        <text class="role-name">{{ role.label }}</text>
        <text class="role-desc">{{ role.desc }}</text>
        <view v-if="selectedRole === role.value" class="selected-badge">
          <text class="badge-text">✓</text>
        </view>
      </view>
    </view>

    <!-- 提示信息 -->
    <view v-if="availableRoles.length === 1" class="info-section">
      <text class="info-text">您当前仅拥有需求方角色</text>
      <text class="info-text">如需成为服务方，请联系运营人员添加</text>
    </view>

    <!-- 确认按钮 -->
    <view class="confirm-section">
      <view class="confirm-btn" :class="{ disabled: !selectedRole }" @click="confirmRole">
        <text class="confirm-text">确认选择</text>
      </view>
      <text class="tip-text">选择后可在"我的"页面切换角色</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { showSuccess } from '@/utils/util'
import { ROLE_LIST } from '@/utils/constants'

const userStore = useUserStore()
const selectedRole = ref(0)

// 可选择的角色（仅用户已分配的角色）
const availableRoles = computed(() => {
  const userRoles = userStore.roles || [1]
  return ROLE_LIST.filter(role => userRoles.includes(role.value))
})

// 默认选中当前角色
onMounted(() => {
  selectedRole.value = userStore.currentRole || 1
})

function selectRole(role) {
  selectedRole.value = role
}

async function confirmRole() {
  if (!selectedRole.value) {
    uni.showToast({ title: '请选择角色', icon: 'none' })
    return
  }

  try {
    await userStore.switchRole(selectedRole.value)
    showSuccess('角色选择成功')
  } catch (error) {
    console.error('角色选择失败:', error)
  }
}
</script>

<style lang="scss" scoped>
.role-select-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 0 32rpx;
}

.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0 60rpx;
}

.header-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16rpx;
}

.header-desc {
  font-size: 28rpx;
  color: #666666;
}

.role-cards {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  margin-bottom: 80rpx;
}

.role-card {
  position: relative;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 48rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 4rpx solid transparent;
  transition: all 0.3s;

  &.active {
    border-color: #4CAF50;
    background-color: #E8F5E9;
  }
}

.role-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;

  &--demander {
    background-color: #E3F2FD;
  }

  &--provider {
    background-color: #E8F5E9;
  }

  .icon-text {
    font-size: 56rpx;
  }
}

.role-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 12rpx;
}

.role-desc {
  font-size: 26rpx;
  color: #666666;
  text-align: center;
}

.selected-badge {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 48rpx;
  height: 48rpx;
  background-color: #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  .badge-text {
    font-size: 28rpx;
    color: #FFFFFF;
  }
}

.info-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
  padding: 24rpx;
  background-color: #FFF8E1;
  border-radius: 12rpx;
}

.info-text {
  font-size: 26rpx;
  color: #FF9800;
  text-align: center;
  margin-bottom: 8rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.confirm-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.confirm-btn {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #4CAF50;
  border-radius: 48rpx;
  margin-bottom: 24rpx;

  &.disabled {
    opacity: 0.5;
  }

  &:active {
    opacity: 0.85;
  }
}

.confirm-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #FFFFFF;
}

.tip-text {
  font-size: 24rpx;
  color: #999999;
}
</style>
