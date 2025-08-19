<template>
  <t-upload theme="image" accept="image/*" :max="1" :size-limit="{ size: 2, unit: 'MB' }"
    tips="支持上传 jpg、png 格式图片，文件大小不超过 2MB" :request-method="uploadRequest" @success="handleUploadSuccess"
    @fail="handleUploadFail" :files="defaultFiles" @remove="handleRemove">
  </t-upload>
</template>

<script lang="ts" setup>
import { uploadFile, getFilePreviewUrl } from '@/apis/file'
import { MessagePlugin } from 'tdesign-vue-next'
import type { UploadFile, RequestMethodResponse, TdUploadProps } from 'tdesign-vue-next'

const value = defineModel({
  type: String,
  default: ''
})

// 默认文件列表，用于显示已有图片
const defaultFiles = computed(() => {
  if (value.value) {
    return [{
      name: 'uploaded-image',
      url: value.value,
      status: 'success' as const
    }]
  }
  return []
})

// 自定义上传方法
const uploadRequest = async (file: UploadFile): Promise<RequestMethodResponse> => {
  try {
    const filename = await uploadFile(file.raw as File)
    const previewUrl = getFilePreviewUrl(filename)
    return {
      status: 'success',
      response: {
        url: previewUrl,
        name: filename
      }
    }
  } catch (error) {
    console.error('上传失败:', error)
    return {
      status: 'fail',
      error: error instanceof Error ? error.message : '上传失败',
      response: {}
    }
  }
}

// 上传成功回调
const handleUploadSuccess = (context: { response?: { url?: string, name?: string } }) => {
  const { response } = context
  if (response && response.url) {
    value.value = response.url  // 保存真实的访问链接
    MessagePlugin.success('图片上传成功')
  }
}

// 上传失败回调
const handleUploadFail: TdUploadProps["onFail"] = ({ e }) => {
  MessagePlugin.error((e instanceof Error ? e.message : `${e}`) || '图片上传失败')
}

const handleRemove: TdUploadProps['onRemove'] = () => {
  value.value = '';
}
</script>

<style scoped lang="less">
.icon-preview {
  img {
    max-width: 100%;
    max-height: 200px;
    object-fit: contain;
  }
}
</style>
