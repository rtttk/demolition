<template>
  <view class="company-manage-page">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-wrapper">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 注册模式：无企业信息 -->
    <view v-else-if="!companyExists" class="register-mode">
      <view class="page-header">
        <text class="page-title">企业注册</text>
        <text class="page-desc">请完善企业基本信息完成注册</text>
      </view>

      <view class="form-section">
        <view class="form-item">
          <text class="form-label required">企业名称</text>
          <input
            class="form-input"
            type="text"
            v-model="form.name"
            placeholder="请输入企业名称"
            :maxlength="50"
          />
        </view>

        <view class="form-item">
          <text class="form-label required">统一社会信用代码</text>
          <input
            class="form-input"
            type="text"
            v-model="form.creditCode"
            placeholder="请输入18位统一社会信用代码"
            :maxlength="18"
          />
          <text v-if="form.creditCode && !creditCodeValid" class="form-error">
            请输入正确的18位统一社会信用代码
          </text>
        </view>

        <view class="form-item">
          <text class="form-label required">联系人</text>
          <input
            class="form-input"
            type="text"
            v-model="form.contactPerson"
            placeholder="请输入联系人姓名"
            :maxlength="20"
          />
        </view>

        <view class="form-item">
          <text class="form-label required">联系电话</text>
          <input
            class="form-input"
            type="number"
            v-model="form.contactPhone"
            placeholder="请输入11位手机号码"
            :maxlength="11"
          />
          <text v-if="form.contactPhone && !phoneValid" class="form-error">
            请输入正确的11位手机号码
          </text>
        </view>

        <view class="form-item">
          <text class="form-label required">企业地址</text>
          <input
            class="form-input"
            type="text"
            v-model="form.address"
            placeholder="请输入企业详细地址"
            :maxlength="200"
          />
        </view>

        <view class="form-item">
          <text class="form-label">企业简介</text>
          <textarea
            class="form-textarea"
            v-model="form.description"
            placeholder="请输入企业简介（选填）"
            :maxlength="500"
          />
          <text class="char-count">{{ (form.description || '').length }}/500</text>
        </view>

        <view class="form-item">
          <text class="form-label required">营业执照</text>
          <image-upload v-model="form.licenseImages" :maxCount="1" />
        </view>
      </view>

      <view class="submit-section safe-area-bottom">
        <view class="submit-btn" :class="{ disabled: !registerFormValid }" @click="handleRegister">
          <text class="submit-text">提交注册</text>
        </view>
      </view>
    </view>

    <!-- 管理模式：已有企业信息 -->
    <view v-else class="manage-mode">
      <!-- 企业信息卡片 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">企业信息</text>
          <view class="status-badge" :class="verificationClass">
            <text class="status-text">{{ verificationText }}</text>
          </view>
        </view>

        <!-- 展示模式 -->
        <view v-if="!isEditing" class="info-display">
          <view class="info-row">
            <text class="info-label">企业名称</text>
            <text class="info-value">{{ company.name || '-' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">信用代码</text>
            <text class="info-value">{{ company.creditCode || '-' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">联系人</text>
            <text class="info-value">{{ company.contactPerson || '-' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">联系电话</text>
            <text class="info-value">{{ company.contactPhone || '-' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">企业地址</text>
            <text class="info-value">{{ company.address || '-' }}</text>
          </view>
          <view v-if="company.description" class="info-row">
            <text class="info-label">企业简介</text>
            <text class="info-value">{{ company.description }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">营业执照</text>
            <view v-if="company.licenseImages && company.licenseImages.length" class="license-preview">
              <image
                class="license-image"
                :src="company.licenseImages[0]"
                mode="aspectFill"
                @click="previewLicense"
              />
            </view>
            <text v-else class="info-value">未上传</text>
          </view>
          <view class="edit-btn" @click="startEdit">
            <text class="edit-btn-text">编辑信息</text>
          </view>
        </view>

        <!-- 编辑模式 -->
        <view v-else class="info-edit">
          <view class="form-item">
            <text class="form-label">企业名称</text>
            <input
              class="form-input"
              type="text"
              v-model="editForm.name"
              placeholder="请输入企业名称"
              :maxlength="50"
            />
          </view>

          <view class="form-item">
            <text class="form-label">联系人</text>
            <input
              class="form-input"
              type="text"
              v-model="editForm.contactPerson"
              placeholder="请输入联系人姓名"
              :maxlength="20"
            />
          </view>

          <view class="form-item">
            <text class="form-label">联系电话</text>
            <input
              class="form-input"
              type="number"
              v-model="editForm.contactPhone"
              placeholder="请输入11位手机号码"
              :maxlength="11"
            />
            <text v-if="editForm.contactPhone && !editPhoneValid" class="form-error">
              请输入正确的11位手机号码
            </text>
          </view>

          <view class="form-item">
            <text class="form-label">企业地址</text>
            <input
              class="form-input"
              type="text"
              v-model="editForm.address"
              placeholder="请输入企业详细地址"
              :maxlength="200"
            />
          </view>

          <view class="form-item">
            <text class="form-label">企业简介</text>
            <textarea
              class="form-textarea"
              v-model="editForm.description"
              placeholder="请输入企业简介（选填）"
              :maxlength="500"
            />
            <text class="char-count">{{ (editForm.description || '').length }}/500</text>
          </view>

          <view class="form-item">
            <text class="form-label">营业执照</text>
            <image-upload v-model="editForm.licenseImages" :maxCount="1" />
          </view>

          <view class="edit-actions">
            <view class="cancel-btn" @click="cancelEdit">
              <text class="cancel-btn-text">取消</text>
            </view>
            <view class="save-btn" @click="handleUpdate">
              <text class="save-btn-text">保存修改</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 团队列表 -->
      <view class="team-section">
        <view class="section-header">
          <text class="section-title">我的团队</text>
          <view class="add-team-btn" @click="createTeam">
            <text class="add-team-text">+ 创建新团队</text>
          </view>
        </view>

        <!-- 团队加载中 -->
        <view v-if="teamLoading" class="team-loading">
          <text class="team-loading-text">加载团队列表...</text>
        </view>

        <!-- 空团队列表 -->
        <view v-else-if="!teamList.length" class="team-empty">
          <text class="team-empty-text">暂无团队，点击上方按钮创建</text>
        </view>

        <!-- 团队卡片列表 -->
        <view v-else class="team-list">
          <view v-for="team in teamList" :key="team.id" class="team-card">
            <view class="team-card-header">
              <text class="team-name">{{ team.name }}</text>
              <view class="team-status" :class="team.status === 1 ? 'active' : 'inactive'">
                <text class="team-status-text">{{ team.status === 1 ? '正常' : '停用' }}</text>
              </view>
            </view>
            <view class="team-card-body">
              <view v-if="team.specialties && team.specialties.length" class="team-specialties">
                <text
                  v-for="spec in team.specialties"
                  :key="spec"
                  class="specialty-tag"
                >{{ spec }}</text>
              </view>
              <view class="team-meta">
                <text class="team-meta-text">成员数：{{ team.teamSize || team.memberCount || 0 }}人</text>
              </view>
            </view>
            <view class="team-card-footer">
              <view class="team-manage-link" @click="goTeamManage(team.id)">
                <text class="team-manage-text">管理</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import ImageUpload from '@/components/image-upload/image-upload.vue'
import { getMyCompany, registerCompany, updateCompany } from '@/api/company'
import { getMyTeam } from '@/api/team'
import { showLoading, hideLoading, showSuccess, showError, previewImage } from '@/utils/util'

// 页面状态
const loading = ref(true)
const companyExists = ref(false)
const company = ref({})
const isEditing = ref(false)
const teamLoading = ref(false)
const teamList = ref([])

// 注册表单
const form = reactive({
  name: '',
  creditCode: '',
  contactPerson: '',
  contactPhone: '',
  address: '',
  description: '',
  licenseImages: []
})

// 编辑表单
const editForm = reactive({
  name: '',
  contactPerson: '',
  contactPhone: '',
  address: '',
  description: '',
  licenseImages: []
})

// 校验规则
const creditCodePattern = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/
const phonePattern = /^1[3-9]\d{9}$/

const creditCodeValid = computed(() => {
  return creditCodePattern.test(form.creditCode)
})

const phoneValid = computed(() => {
  return phonePattern.test(form.contactPhone)
})

const editPhoneValid = computed(() => {
  if (!editForm.contactPhone) return true
  return phonePattern.test(editForm.contactPhone)
})

const registerFormValid = computed(() => {
  return (
    form.name.trim() &&
    creditCodeValid.value &&
    form.contactPerson.trim() &&
    phoneValid.value &&
    form.address.trim() &&
    form.licenseImages.length > 0
  )
})

// 认证状态
const verificationText = computed(() => {
  const status = company.value.verificationStatus
  if (status === 1) return '已认证'
  if (status === 2) return '认证中'
  if (status === 3) return '未通过'
  return '未认证'
})

const verificationClass = computed(() => {
  const status = company.value.verificationStatus
  if (status === 1) return 'verified'
  if (status === 2) return 'pending'
  if (status === 3) return 'rejected'
  return 'unverified'
})

// 加载企业信息
async function loadCompany() {
  loading.value = true
  try {
    const res = await getMyCompany()
    const data = res.data || res
    if (data && data.id) {
      companyExists.value = true
      company.value = data
      loadTeamList()
    } else {
      companyExists.value = false
    }
  } catch (error) {
    // 接口报错通常表示未注册企业
    companyExists.value = false
  } finally {
    loading.value = false
  }
}

// 加载团队列表
async function loadTeamList() {
  teamLoading.value = true
  try {
    const res = await getMyTeam()
    const data = res.data || res
    teamList.value = Array.isArray(data) ? data : (data.list || data.records || [])
  } catch (error) {
    console.error('获取团队列表失败:', error)
    teamList.value = []
  } finally {
    teamLoading.value = false
  }
}

// 提交注册
async function handleRegister() {
  if (!registerFormValid.value) {
    showError('请完善必填信息')
    return
  }
  showLoading('提交中...')
  try {
    await registerCompany({
      name: form.name.trim(),
      creditCode: form.creditCode.trim(),
      contactPerson: form.contactPerson.trim(),
      contactPhone: form.contactPhone.trim(),
      address: form.address.trim(),
      description: form.description.trim(),
      licenseImages: form.licenseImages
    })
    hideLoading()
    showSuccess('注册成功')
    // 重新加载进入管理模式
    setTimeout(() => {
      loadCompany()
    }, 1500)
  } catch (error) {
    hideLoading()
    showError(error.message || '注册失败，请重试')
  }
}

// 进入编辑模式
function startEdit() {
  editForm.name = company.value.name || ''
  editForm.contactPerson = company.value.contactPerson || ''
  editForm.contactPhone = company.value.contactPhone || ''
  editForm.address = company.value.address || ''
  editForm.description = company.value.description || ''
  editForm.licenseImages = company.value.licenseImages || []
  isEditing.value = true
}

// 取消编辑
function cancelEdit() {
  isEditing.value = false
}

// 保存编辑
async function handleUpdate() {
  if (!editForm.name.trim()) {
    showError('企业名称不能为空')
    return
  }
  if (editForm.contactPhone && !editPhoneValid.value) {
    showError('请输入正确的手机号码')
    return
  }
  showLoading('保存中...')
  try {
    const res = await updateCompany({
      name: editForm.name.trim(),
      contactPerson: editForm.contactPerson.trim(),
      contactPhone: editForm.contactPhone.trim(),
      address: editForm.address.trim(),
      description: editForm.description.trim(),
      licenseImages: editForm.licenseImages
    })
    hideLoading()
    showSuccess('保存成功')
    isEditing.value = false
    // 刷新企业信息
    const data = res.data || res
    if (data) {
      company.value = { ...company.value, ...data }
    } else {
      await loadCompany()
    }
  } catch (error) {
    hideLoading()
    showError(error.message || '保存失败，请重试')
  }
}

// 预览营业执照
function previewLicense() {
  if (company.value.licenseImages && company.value.licenseImages.length) {
    previewImage(company.value.licenseImages[0], company.value.licenseImages)
  }
}

// 创建新团队
function createTeam() {
  uni.navigateTo({
    url: '/provider/team/manage?mode=create'
  })
}

// 跳转团队管理
function goTeamManage(teamId) {
  uni.navigateTo({
    url: `/provider/team/manage?id=${teamId}`
  })
}

onMounted(() => {
  loadCompany()
})
</script>

<style lang="scss" scoped>
.company-manage-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 160rpx;
}

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.loading-text {
  font-size: $font-size-base;
  color: $text-secondary;
}

// 注册模式
.register-mode {
  padding: 0;
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

// 管理模式
.manage-mode {
  padding: 0;
}

.info-card {
  background-color: $bg-card;
  margin: 20rpx 24rpx;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx 0;
}

.card-title {
  font-size: $font-size-lg;
  font-weight: bold;
  color: $text-title;
}

.status-badge {
  padding: 6rpx 20rpx;
  border-radius: $radius-round;

  &.verified {
    background-color: rgba(7, 193, 96, 0.1);
    .status-text {
      color: $success-color;
    }
  }

  &.pending {
    background-color: rgba(250, 173, 20, 0.1);
    .status-text {
      color: $warning-color;
    }
  }

  &.rejected {
    background-color: rgba(250, 81, 81, 0.1);
    .status-text {
      color: $error-color;
    }
  }

  &.unverified {
    background-color: rgba(153, 153, 153, 0.1);
    .status-text {
      color: $text-secondary;
    }
  }
}

.status-text {
  font-size: $font-size-xs;
  font-weight: bold;
}

// 信息展示
.info-display {
  padding: 24rpx 32rpx 32rpx;
}

.info-row {
  display: flex;
  align-items: flex-start;
  padding: 16rpx 0;
  border-bottom: 1rpx solid $border-color-light;

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: $font-size-sm;
  color: $text-secondary;
  width: 160rpx;
  flex-shrink: 0;
}

.info-value {
  font-size: $font-size-base;
  color: $text-main;
  flex: 1;
  word-break: break-all;
}

.license-preview {
  flex: 1;
}

.license-image {
  width: 200rpx;
  height: 280rpx;
  border-radius: $radius-md;
  border: 1rpx solid $border-color;
}

.edit-btn {
  margin-top: 24rpx;
  padding: 20rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $primary-light;
  border-radius: $radius-md;
}

.edit-btn-text {
  font-size: $font-size-base;
  color: $primary-color;
  font-weight: bold;
}

// 信息编辑
.info-edit {
  padding: 24rpx 32rpx 32rpx;
}

.edit-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 16rpx;
}

.cancel-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid $border-color;
  border-radius: $radius-md;
}

.cancel-btn-text {
  font-size: $font-size-base;
  color: $text-secondary;
}

.save-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $primary-color;
  border-radius: $radius-md;
}

.save-btn-text {
  font-size: $font-size-base;
  font-weight: bold;
  color: #FFFFFF;
}

// 团队列表
.team-section {
  margin: 20rpx 24rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
  padding: 0 8rpx;
}

.section-title {
  font-size: $font-size-lg;
  font-weight: bold;
  color: $text-title;
}

.add-team-btn {
  padding: 10rpx 24rpx;
  background-color: $primary-light;
  border-radius: $radius-round;
}

.add-team-text {
  font-size: $font-size-sm;
  color: $primary-color;
  font-weight: bold;
}

.team-loading,
.team-empty {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 60rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-sm;
}

.team-loading-text,
.team-empty-text {
  font-size: $font-size-base;
  color: $text-placeholder;
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.team-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 28rpx 32rpx;
  box-shadow: $shadow-sm;
}

.team-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.team-name {
  font-size: $font-size-md;
  font-weight: bold;
  color: $text-title;
}

.team-status {
  padding: 4rpx 16rpx;
  border-radius: $radius-round;

  &.active {
    background-color: rgba(7, 193, 96, 0.1);
    .team-status-text {
      color: $success-color;
    }
  }

  &.inactive {
    background-color: rgba(153, 153, 153, 0.1);
    .team-status-text {
      color: $text-secondary;
    }
  }
}

.team-status-text {
  font-size: $font-size-xs;
  font-weight: bold;
}

.team-card-body {
  margin-bottom: 16rpx;
}

.team-specialties {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.specialty-tag {
  font-size: $font-size-xs;
  color: $primary-color;
  background-color: $primary-light;
  padding: 6rpx 16rpx;
  border-radius: $radius-round;
}

.team-meta {
  display: flex;
  align-items: center;
}

.team-meta-text {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.team-card-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 16rpx;
  border-top: 1rpx solid $border-color-light;
}

.team-manage-link {
  padding: 10rpx 32rpx;
  background-color: $primary-light;
  border-radius: $radius-round;
}

.team-manage-text {
  font-size: $font-size-sm;
  color: $primary-color;
  font-weight: bold;
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
