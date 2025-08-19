import { useUserStore } from '@/store/UserStore'

/**
 * 上传文件
 * @param file 文件对象
 * @returns Promise<string> 返回文件名
 */
export const uploadFile = async (file: File): Promise<string> => {
  const userStore = useUserStore()
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/file/upload', {
    method: 'POST',
    headers: {
      'authorization': userStore.token
    },
    body: formData
  })

  if (!response.ok) {
    throw new Error(`上传失败: ${response.statusText}`)
  }

  const { data, code, msg } = await response.json()
  if (code !== 200) {
    throw new Error(`上传失败: ${msg}`)
  }
  return data
}

/**
 * 获取文件预览URL
 * @param filename 文件名
 * @returns 预览URL
 */
export const getFilePreviewUrl = (filename: string): string => {
  return `/api/file/preview/${filename}`
}