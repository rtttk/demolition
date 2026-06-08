<template>
  <view class="team-manage-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="page-title">{{ isCreateMode ? '创建团队' : '编辑团队' }}</text>
      <text class="page-desc">{{ isCreateMode ? '请填写团队基本信息' : '修改团队信息' }}</text>
    </view>

    <!-- 表单区域 -->
    <view class="form-section">
      <!-- 团队名称 -->
      <view class="form-item">
        <text class="form-label required">团队名称</text>
        <input
          class="form-input"
          type="text"
          v-model="form.name"
          placeholder="请输入团队名称"
          :maxlength="30"
        />
      </view>

      <!-- A角负责人 -->
      <view class="form-group">
        <text class="group-title">A角负责人</text>
        <view class="form-item">
          <text class="form-label required">姓名</text>
          <input
            class="form-input"
            type="text"
            v-model="form.leaderAName"
            placeholder="请输入A角负责人姓名"
            :maxlength="20"
          />
        </view>
        <view class="form-item">
          <text class="form-label required">联系电话</text>
          <input
            class="form-input"
            type="number"
            v-model="form.leaderAPhone"
            placeholder="请输入11位手机号码"
            :maxlength="11"
          />
          <text v-if="form.leaderAPhone && !leaderAPhoneValid" class="form-error">
            请输入正确的11位手机号码
          </text>
        </view>
      </view>

      <!-- B角负责人 -->
      <view class="form-group">
        <text class="group-title">B角负责人 <text class="optional-tag">选填</text></text>
        <view class="form-item">
          <text class="form-label">姓名</text>
          <input
            class="form-input"
            type="text"
            v-model="form.leaderBName"
            placeholder="请输入B角负责人姓名"
            :maxlength="20"
          />
        </view>
        <view class="form-item">
          <text class="form-label">联系电话</text>
          <input
            class="form-input"
            type="number"
            v-model="form.leaderBPhone"
            placeholder="请输入11位手机号码"
            :maxlength="11"
          />
          <text v-if="form.leaderBPhone && !leaderBPhoneValid" class="form-error">
            请输入正确的11位手机号码
          </text>
        </view>
      </view>

      <!-- 团队规模 -->
      <view class="form-item">
        <text class="form-label">团队规模 <text class="optional-tag">选填</text></text>
        <input
          class="form-input"
          type="number"
          v-model="form.teamSize"
          placeholder="请输入团队人数"
        />
      </view>

      <!-- 擅长类型（多选） -->
      <view class="form-item">
        <text class="form-label">擅长类型</text>
        <view class="specialty-select">
          <view
            v-for="option in demoTypeOptions"
            :key="option.value"
            class="specialty-option"
            :class="{ selected: form.specialties.includes(option.value) }"
            @click="toggleSpecialty(option.value)"
          >
            <text class="specialty-option-text">{{ option.label }}</text>
          </view>
        </view>
      </view>

      <!-- 服务区域 -->
      <view class="form-item">
        <text class="form-label">服务区域 <text class="optional-tag">选填</text></text>
        <input
          class="form-input"
          type="text"
          v-model="form.serviceArea"
          placeholder="请输入服务区域，如：北京市朝阳区"
          :maxlength="100"
        />
      </view>

      <!-- 团队简介 -->
      <view class="form-item">
        <text class="form-label">团队简介 <text class="optional-tag">选填</text></text>
        <textarea
          class="form-textarea"
          v-model="form.description"
          placeholder="请输入团队简介"
          :maxlength="500"
        />
        <text class="char-count">{{ (form.description || '').length }}/500</text>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section safe-area-bottom">
      <view class="submit-btn" :class="{ disabled: !formValid }" @click="handleSubmit">
        <text class="submit-text">{{ isCreateMode ? '创建团队' : '保存修改' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { createTeam, updateTeam, getMyTeam } from '@/api/team'
import { getMyCompany } from '@/api/company'
import { DEMO_TYPE_OPTIONS } from '@/utils/constants'
import { showLoading, hideLoading, showSuccess, showError } from '@/utils/util'

// 页面模式
const isCreateMode = ref(true)
const editTeamId = ref(null)
const companyId = ref(null)

// 擅长类型选项
const demoTypeOptions = DEMO_TYPE_OPTIONS

// 表单数据
const form = reactive({
  name: '',
  leaderAName: '',
  leaderAPhone: '',
  leaderBName: '',
  leaderBPhone: '',
  teamSize: '',
  specialties: [],
  serviceArea: '',
  description: ''
})

// 校验规则
const phonePattern = /^1[3-9]\d{9}$/

const leaderAPhoneValid = computed(() => {
  return phonePattern.test(form.leaderAPhone)
})

const leaderBPhoneValid = computed(() => {
  if (!form.leaderBPhone) return true
  return phonePattern.test(form.leaderBPhone)
})

const formValid = computed(() => {
  return (
    form.name.trim() &&
    form.leaderAName.trim() &&
    leaderAPhoneValid.value
  )
})

// 切换擅长类型
function toggleSpecialty(value) {
  const index = form.specialties.indexOf(value)
  if (index > -1) {
    form.specialties.splice(index, 1)
  } else {
    form.specialties.push(value)
  }
}

// 获取企业ID
async function loadCompanyId() {
  try {
    const res = await getMyCompany()
    const data = res.data || res
    if (data && data.id) {
      companyId.value = data.id
    }
  } catch (error) {
    console.error('获取企业信息失败:', error)
  }
}

// 加载团队信息（编辑模式）
async function loadTeam(teamId) {
  showLoading('加载中...')
  try {
    const res = await getMyTeam()
    const data = res.data || res
    const list = Array.isArray(data) ? data : (data.list || data.records || [])
    const team = list.find(t => String(t.id) === String(teamId))
    if (team) {
      form.name = team.name || ''
      form.leaderAName = team.leaderAName || ''
      form.leaderAPhone = team.leaderAPhone || ''
      form.leaderBName = team.leaderBName || ''
      form.leaderBPhone = team.leaderBPhone || ''
      form.teamSize = team.teamSize || ''
      form.specialties = team.specialties
        ? (Array.isArray(team.specialties) ? team.specialties : String(team.specialties).split(',').map(Number))
        : []
      form.serviceArea = team.serviceArea || ''
      form.description = team.description || ''
      companyId.value = team.companyId || team.company_id || null
    } else {
      showError('未找到该团队信息')
    }
  } catch (error) {
    console.error('获取团队信息失败:', error)
    showError('加载团队信息失败')
  } finally {
    hideLoading()
  }
}

// 提交表单
async function handleSubmit() {
  if (!formValid.value) {
    showError('请完善必填信息')
    return
  }
  if (form.leaderBPhone && !leaderBPhoneValid.value) {
    showError('请输入正确的B角负责人手机号码')
    return
  }

  const submitData = {
    name: form.name.trim(),
    leaderAName: form.leaderAName.trim(),
    leaderAPhone: form.leaderAPhone.trim(),
    leaderBName: form.leaderBName ? form.leaderBName.trim() : '',
    leaderBPhone: form.leaderBPhone ? form.leaderBPhone.trim() : '',
    teamSize: form.teamSize ? Number(form.teamSize) : null,
    specialties: form.specialties,
    serviceArea: form.serviceArea ? form.serviceArea.trim() : '',
    description: form.description ? form.description.trim() : ''
  }

  showLoading(isCreateMode.value ? '创建中...' : '保存中...')
  try {
    if (isCreateMode.value) {
      if (!companyId.value) {
        hideLoading()
        showError('请先注册企业')
        return
      }
      await createTeam({ ...submitData, companyId: companyId.value })
      hideLoading()
      showSuccess('团队创建成功')
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      await updateTeam(editTeamId.value, submitData)
      hideLoading()
      showSuccess('保存成功')
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (error) {
    hideLoading()
    showError(error.message || (isCreateMode.value ? '创建失败' : '保存失败'))
  }
}

// 页面加载
onLoad((options) => {
  if (options && options.mode === 'create') {
    isCreateMode.value = true
    loadCompanyId()
  } else if (options && options.id) {
    isCreateMode.value = false
    editTeamId.value = options.id
    loadTeam(options.id)
  } else {
    // 默认创建模式
    isCreateMode.value = true
    loadCompanyId()
  }
})
</script>

<style lang="scss" scoped>
.team-manage-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 160rpx;
}

.page-header {
  background-color: $primary-color;
  padding: 60rpx 32rpx 48rpx;
}

.page-title {
  font-size: $font-size-xxl;
  font-weight: bold;
  color: #FFFFFF;
  display: block;
  margin-bottom: 12rpx;
}

.page-desc {
  font-size: $font-size-sm;
  color: rgba(255, 255, 255, 0.85);
}

.form-section {
  background-color: $bg-card;
  padding: 28rpx 32rpx;
  margin: 20rpx 24rpx;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.form-group {
  padding: 24rpx 0;
  margin-bottom: 8rpx;
  border-top: 1rpx solid $border-color-light;
}

.group-title {
  font-size: $font-size-md;
  font-weight: bold;
  color: $primary-color;
  margin-bottom: 20rpx;
  display: block;
}

.optional-tag {
  font-size: $font-size-xs;
  color: $text-placeholder;
  font-weight: normal;
}

.form-item {
  margin-bottom: 28rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  font-size: $font-size-base;
  color: $text-title;
  font-weight: bold;
  margin-bottom: 12rpx;
  display: block;

  &.required::before {
    content: '*';
    color: $error-color;
    margin-right: 4rpx;
  }
}

.form-input {
  font-size: $font-size-base;
  color: $text-main;
  height: 80rpx;
  padding: 0 24rpx;
  background-color: $bg-gray;
  border-radius: $radius-md;
  border: 2rpx solid transparent;
  transition: border-color 0.2s;

  &:focus {
    border-color: $primary-color;
    background-color: #FFFFFF;
  }
}

.form-textarea {
  font-size: $font-size-base;
  color: $text-main;
  width: 100%;
  min-height: 180rpx;
  padding: 20rpx 24rpx;
  background-color: $bg-gray;
  border-radius: $radius-md;
  line-height: 1.6;
  border: 2rpx solid transparent;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    border-color: $primary-color;
    background-color: #FFFFFF;
  }
}

.form-error {
  font-size: $font-size-xs;
  color: $error-color;
  margin-top: 8rpx;
  display: block;
}

.char-count {
  font-size: $font-size-xs;
  color: $text-placeholder;
  text-align: right;
  margin-top: 8rpx;
  display: block;
}

// 擅长类型多选
.specialty-select {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.specialty-option {
  padding: 14rpx 28rpx;
  background-color: $bg-gray;
  border: 2rpx solid $border-color;
  border-radius: $radius-round;
  transition: all 0.2s;

  &.selected {
    background-color: $primary-light;
    border-color: $primary-color;

    .specialty-option-text {
      color: $primary-color;
      font-weight: bold;
    }
  }
}

.specialty-option-text {
  font-size: $font-size-sm;
  color: $text-main;
}

// 底部提交按钮
.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 32rpx;
  background-color: $bg-card;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.submit-btn {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $primary-color;
  border-radius: $radius-lg;
  transition: opacity 0.2s;

  &.disabled {
    opacity: 0.5;
  }
}

.submit-text {
  font-size: $font-size-lg;
  font-weight: bold;
  color: #FFFFFF;
}
</style>
