import type { SourceRandomRecordType } from '@/types/SourceRandom'

export function useMediaUtils() {
  const isImage = (item: SourceRandomRecordType): boolean => {
    const url = getMediaUrl(item)
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url)
  }

  const isVideo = (item: SourceRandomRecordType): boolean => {
    const url = getMediaUrl(item)
    return /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i.test(url)
  }

  const getMediaUrl = (item: SourceRandomRecordType): string => {
    if (typeof item === 'string') {
      return item
    }
    return item.url || ''
  }

  const getMediaTitle = (item: SourceRandomRecordType): string => {
    if (typeof item === 'string') {
      return ''
    }
    return item.title || ''
  }

  const getMediaDesc = (item: SourceRandomRecordType): string => {
    if (typeof item === 'string') {
      return ''
    }
    return item.desc || ''
  }

  return {
    isImage,
    isVideo,
    getMediaUrl,
    getMediaTitle,
    getMediaDesc
  }
}