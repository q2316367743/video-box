import { SourceSubscribeMediaType } from '@/types/SourceSubscribe';

/**
 * 根据文件扩展名或MIME类型检测媒体类型
 */
export const detectMediaType = (url: string, mimeType?: string): SourceSubscribeMediaType => {
  // 如果提供了MIME类型，优先使用
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 1;
    if (mimeType.startsWith('video/')) return 2;
    if (mimeType.startsWith('audio/')) return 3;
  }

  // 从URL提取文件扩展名
  const extension = url.split('.').pop()?.toLowerCase() || '';
  
  // 图片格式
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff'];
  if (imageExtensions.includes(extension)) {
    return 1;
  }
  
  // 视频格式
  const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'm4v', 'mkv'];
  if (videoExtensions.includes(extension)) {
    return 2;
  }
  
  // 音频格式
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma', 'opus'];
  if (audioExtensions.includes(extension)) {
    return 3;
  }
  
  // 默认返回图片类型
  return 1;
};

/**
 * 获取媒体类型的显示名称
 */
export const getMediaTypeName = (type: SourceSubscribeMediaType): string => {
  switch (type) {
    case 1: return '图片';
    case 2: return '视频';
    case 3: return '音频';
    default: return '未知';
  }
};

/**
 * 检查是否为支持的媒体格式
 */
export const isSupportedMediaFormat = (url: string): boolean => {
  const extension = url.split('.').pop()?.toLowerCase() || '';
  const supportedExtensions = [
    // 图片
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff',
    // 视频
    'mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'm4v', 'mkv',
    // 音频
    'mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma', 'opus'
  ];
  
  return supportedExtensions.includes(extension);
};

/**
 * 获取媒体文件的缩略图URL（用于音频和视频的预览）
 */
export const getMediaThumbnail = (url: string, type: SourceSubscribeMediaType): string => {
  // 对于图片，直接返回原URL
  if (type === 1) {
    return url;
  }
  
  // 对于视频和音频，可以返回默认缩略图或者使用第三方服务生成
  // 这里先返回占位图片
  if (type === 2) {
    return `https://placehold.co/200x150/1a1a1a/ffffff?text=视频`;
  }
  
  if (type === 3) {
    return `https://placehold.co/200x150/2a2a2a/ffffff?text=音频`;
  }
  
  return url;
};

/**
 * 格式化时间显示（秒转换为 mm:ss 格式）
 */
export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * 获取文件大小的友好显示
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};