<template>
  <view class="employee-info-page">
    <!-- 员工信息 -->
    <view class="info-section">
      <text class="section-title">员工信息</text>

      <!-- 真实姓名 -->
      <view class="form-item">
        <text class="form-label required">真实姓名</text>
        <input
          class="form-input"
          type="text"
          v-model="form.realName"
          placeholder="请输入真实姓名"
          placeholder-class="input-placeholder"
        />
      </view>

      <!-- 性别 -->
      <view class="form-item">
        <text class="form-label required">性别</text>
        <picker
          :range="genderOptions"
          range-key="label"
          :value="genderIndex"
          @change="onGenderChange"
        >
          <view class="form-picker" :class="{ 'is-placeholder': !form.gender }">
            <text>{{ genderIndex >= 0 ? genderOptions[genderIndex].label : '请选择性别' }}</text>
            <text class="picker-arrow">></text>
          </view>
        </picker>
      </view>

      <!-- 年龄 -->
      <view class="form-item">
        <text class="form-label required">年龄</text>
        <input
          class="form-input"
          type="number"
          v-model="form.age"
          placeholder="请输入年龄"
          placeholder-class="input-placeholder"
        />
      </view>

      <!-- 身份证号 -->
      <view class="form-item">
        <text class="form-label required">身份证号</text>
        <input
          class="form-input"
          type="text"
          v-model="form.idCardNo"
          placeholder="请输入18位身份证号"
          maxlength="18"
          placeholder-class="input-placeholder"
        />
      </view>

      <!-- 从业年限 -->
      <view class="form-item">
        <text class="form-label required">从业年限</text>
        <input
          class="form-input"
          type="number"
          v-model="form.workYears"
          placeholder="请输入从业年限"
          placeholder-class="input-placeholder"
        />
      </view>

      <!-- 资质等级 -->
      <view class="form-item">
        <text class="form-label required">资质等级</text>
        <picker
          :range="qualificationOptions"
          range-key="label"
          :value="qualificationIndex"
          @change="onQualificationChange"
        >
          <view class="form-picker" :class="{ 'is-placeholder': !form.qualificationLevel }">
            <text>{{ qualificationIndex >= 0 ? qualificationOptions[qualificationIndex].label : '请选择资质等级' }}</text>
            <text class="picker-arrow">></text>
          </view>
        </picker>
      </view>

      <!-- 所属团队 -->
      <view class="form-item">
        <text class="form-label required">所属团队</text>
        <picker
          :range="teamOptions"
          range-key="name"
          :value="teamIndex"
          @change="onTeamChange"
        >
          <view class="form-picker" :class="{ 'is-placeholder': !form.teamId }">
            <text>{{ teamIndex >= 0 ? teamOptions[teamIndex].name : '请选择所属团队' }}</text>
            <text class="picker-arrow">></text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 身份证照片 -->
    <view class="info-section">
      <text class="section-title">身份证照片</text>

      <!-- 身份证正面 -->
      <view class="form-item">
        <text class="form-label required">身份证正面照片</text>
        <image-upload v-model="form.idCardFront" :maxCount="1" />
      </view>

      <!-- 身份证反面 -->
      <view class="form-item">
        <text class="form-label required">身份证反面照片</text>
        <image-upload v-model="form.idCardBack" :maxCount="1" />
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="submit-section safe-area-bottom">
      <view class="submit-btn" @click="handleSave">
        <text class="submit-text">保存信息</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onMounted } from 'vue'
import ImageUpload from '@/components/image-upload/image-upload.vue'
import { getUserProfile, updateUserProfile } from '@/api/user'
import { getMyTeam } from '@/api/team'
import { uploadSingleFile } from '@/api/file'
import { showLoading, hideLoading, showSuccess, showError } from '@/utils/util'

// 性别选项
const genderOptions = [
  { label: '男', value: 1 },
  { label: '女', value: 2 }
]

// 资质等级选项
const qualificationOptions = [
  { label: '初级', value: 1 },
  { label: '中级', value: 2 },
  { label: '高级', value: 3 },
  { label: '特级', value: 4 }
]

// 团队列表
const teamList = ref([])
const teamOptions = computed(() => teamList.value.map(team => ({
  id: team.id,
  name: team.name
})))

// 表单数据
const form = reactive({
  realName: '',
  gender: null,
  age: '',
  idCardNo: '',
  workYears: '',
  qualificationLevel: null,
  teamId: null,
  idCardFront: [],
  idCardBack: []
})

// picker 索引
const genderIndex = ref(-1)
const qualificationIndex = ref(-1)
const teamIndex = ref(-1)

// 性别选择
function onGenderChange(e) {
  const index = Number(e.detail.value)
  genderIndex.value = index
  form.gender = genderOptions[index].value
}

// 资质等级选择
function onQualificationChange(e) {
  const index = Number(e.detail.value)
  qualificationIndex.value = index
  form.qualificationLevel = qualificationOptions[index].value
}

// 团队选择
function onTeamChange(e) {
  const index = Number(e.detail.value)
  teamIndex.value = index
  form.teamId = teamOptions.value[index].id
}

/**
 * 身份证号校验
 * @param {string} idCardNo
 * @returns {boolean}
 */
function validateIdCardNo(idCardNo) {
  if (!idCardNo) return false
  const reg = /^\d{17}[\dX]$/
  return reg.test(idCardNo)
}

/**
 * 表单校验
 * @returns {boolean}
 */
function validateForm() {
  if (!form.realName || !form.realName.trim()) {
    showError('请输入真实姓名')
    return false
  }
  if (!form.gender) {
    showError('请选择性别')
    return false
  }
  if (!form.age) {
    showError('请输入年龄')
    return false
  }
  const ageNum = Number(form.age)
  if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
    showError('年龄须在18-65岁之间')
    return false
  }
  if (!form.idCardNo || !form.idCardNo.trim()) {
    showError('请输入身份证号')
    return false
  }
  if (!validateIdCardNo(form.idCardNo.trim())) {
    showError('身份证号格式不正确，须为18位数字（末位可为X）')
    return false
  }
  if (!form.workYears) {
    showError('请输入从业年限')
    return false
  }
  const yearsNum = Number(form.workYears)
  if (isNaN(yearsNum) || yearsNum < 1 || yearsNum > 50) {
    showError('从业年限须在1-50年之间')
    return false
  }
  if (!form.qualificationLevel) {
    showError('请选择资质等级')
    return false
  }
  if (!form.teamId) {
    showError('请选择所属团队')
    return false
  }
  if (!form.idCardFront || form.idCardFront.length === 0) {
    showError('请上传身份证正面照片')
    return false
  }
  if (!form.idCardBack || form.idCardBack.length === 0) {
    showError('请上传身份证反面照片')
    return false
  }
  return true
}

/**
 * 加载用户资料
 */
async function loadUserProfile() {
  try {
    const res = await getUserProfile()
    const data = res.data || res
    if (data) {
      form.realName = data.realName || ''
      form.gender = data.gender || null
      form.age = data.age != null ? String(data.age) : ''
      form.idCardNo = data.idCardNo || ''
      form.workYears = data.workYears != null ? String(data.workYears) : ''
      form.qualificationLevel = data.qualificationLevel || null
      form.teamId = data.teamId || null

      // 身份证照片
      if (data.idCardImages && Array.isArray(data.idCardImages)) {
        form.idCardFront = data.idCardImages.length > 0 ? [data.idCardImages[0]] : []
        form.idCardBack = data.idCardImages.length > 1 ? [data.idCardImages[1]] : []
      }

      // 回显性别 picker
      if (form.gender) {
        const idx = genderOptions.findIndex(item => item.value === form.gender)
        if (idx >= 0) genderIndex.value = idx
      }

      // 回显资质等级 picker
      if (form.qualificationLevel) {
        const idx = qualificationOptions.findIndex(item => item.value === form.qualificationLevel)
        if (idx >= 0) qualificationIndex.value = idx
      }
    }
  } catch (error) {
    console.error('加载用户资料失败:', error)
  }
}

/**
 * 加载团队列表
 */
async function loadTeamList() {
  try {
    const res = await getMyTeam()
    const data = res.data || res
    if (Array.isArray(data)) {
      teamList.value = data
      // 如果已有 teamId，回显 picker 索引
      if (form.teamId) {
        const idx = teamList.value.findIndex(t => t.id === form.teamId)
        if (idx >= 0) teamIndex.value = idx
      }
    }
  } catch (error) {
    console.error('加载团队列表失败:', error)
  }
}

/**
 * 保存信息
 */
async function handleSave() {
  if (!validateForm()) return

  showLoading('保存中...')
  try {
    // 组装身份证图片数组
    const idCardImages = [
      ...(form.idCardFront || []),
      ...(form.idCardBack || [])
    ]

    const params = {
      realName: form.realName.trim(),
      gender: form.gender,
      age: Number(form.age),
      idCardNo: form.idCardNo.trim(),
      workYears: Number(form.workYears),
      qualificationLevel: form.qualificationLevel,
      teamId: form.teamId,
      idCardImages
    }

    await updateUserProfile(params)
    hideLoading()
    showSuccess('保存成功')
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    hideLoading()
    console.error('保存失败:', error)
    showError('保存失败，请重试')
  }
}

// 页面加载
onMounted(() => {
  loadUserProfile()
  loadTeamList()
})
</script>

<style lang="scss" scoped>
.employee-info-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 140rpx;
}

.info-section {
  background-color: $bg-card;
  padding: 28rpx 32rpx;
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: $font-size-md;
  font-weight: bold;
  color: $text-title;
  margin-bottom: 24rpx;
  display: block;
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
  height: 72rpx;
  padding: 0 20rpx;
  background-color: $bg-gray;
  border-radius: $radius-md;
  width: 100%;
  box-sizing: border-box;
}

.input-placeholder {
  color: $text-placeholder;
  font-size: $font-size-base;
}

.form-picker {
  font-size: $font-size-base;
  color: $text-main;
  height: 72rpx;
  padding: 0 20rpx;
  background-color: $bg-gray;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &.is-placeholder {
    color: $text-placeholder;
  }
}

.picker-arrow {
  font-size: $font-size-sm;
  color: $text-placeholder;
}

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

  .submit-text {
    font-size: $font-size-lg;
    font-weight: bold;
    color: #FFFFFF;
  }
}
</style>
