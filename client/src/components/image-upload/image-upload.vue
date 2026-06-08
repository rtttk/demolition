<template>
  <view class="image-upload">
    <!-- 已上传图片列表 -->
    <view class="image-list">
      <view
        v-for="(item, index) in imageList"
        :key="index"
        class="image-item"
      >
        <image
          class="preview-image"
          :src="item"
          mode="aspectFill"
          @click="previewImage(index)"
        />
        <!-- 删除按钮 -->
        <view class="delete-btn" @click.stop="deleteImage(index)">
          <text class="delete-icon">&times;</text>
        </view>
      </view>

      <!-- 添加按钮 -->
      <view
        v-if="imageList.length < maxCount"
        class="add-btn"
        @click="chooseImage"
      >
        <text class="add-icon">+</text>
        <text class="add-text">{{ imageList.length }}/{{ maxCount }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import { chooseImage as chooseImageUtil, previewImage as previewImageUtil } from '@/utils/util'
import { uploadSingleFile } from '@/api/file'

const props = defineProps({
  // 最大上传数量
  maxCount: {
    type: Number,
    default: 9
  },
  // 图片列表 (v-model)
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'update:fileIds'])

// 图片列表（URL）
const imageList = ref([...props.modelValue])
// 文件ID列表
const fileIdList = ref([])

// 监听外部值变化
watch(() => props.modelValue, (val) => {
  imageList.value = [...val]
})

/**
 * 选择图片
 */
async function chooseImage() {
  try {
    const remainCount = props.maxCount - imageList.value.length
    if (remainCount <= 0) return

    const tempFilePaths = await chooseImageUtil(remainCount)

    // 上传图片
    for (const filePath of tempFilePaths) {
      try {
        const res = await uploadSingleFile(filePath)
        const url = res.data?.url || res.url || filePath
        const fileId = res.data?.id || res.id || null
        imageList.value.push(url)
        if (fileId) fileIdList.value.push(fileId)
      } catch (error) {
        console.error('图片上传失败:', error)
        // 上传失败时使用本地路径
        imageList.value.push(filePath)
      }
    }

    emit('update:modelValue', [...imageList.value])
    emit('update:fileIds', [...fileIdList.value])
  } catch (error) {
    console.error('选择图片失败:', error)
  }
}

/**
 * 删除图片
 */
function deleteImage(index) {
  imageList.value.splice(index, 1)
  if (fileIdList.value[index] !== undefined) fileIdList.value.splice(index, 1)
  emit('update:modelValue', [...imageList.value])
  emit('update:fileIds', [...fileIdList.value])
}

/**
 * 预览图片
 */
function previewImage(index) {
  previewImageUtil(imageList.value[index], imageList.value)
}
</script>

<style lang="scss" scoped>
.image-upload {
  width: 100%;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.image-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: $radius-md;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.delete-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 44rpx;
  height: 44rpx;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 0 0 $radius-md;

  .delete-icon {
    font-size: 32rpx;
    color: #FFFFFF;
    line-height: 1;
  }
}

.add-btn {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed $border-color;
  border-radius: $radius-md;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  background-color: $bg-gray;
}

.add-icon {
  font-size: 56rpx;
  color: $text-placeholder;
  line-height: 1;
}

.add-text {
  font-size: $font-size-xs;
  color: $text-placeholder;
}
</style>
