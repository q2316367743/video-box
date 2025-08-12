// 多媒体预览插件导出
export {
  showMediaPlugin,
  showImagesPlugin, // 向后兼容
  initMediaClickListener,
  startMediaClickListener,
  stopMediaClickListener
} from './MediaPlugin';

// 保持向后兼容的旧版本导出
export {
  showImagesPlugin as showImagePlugin,
  initMediaClickListener as initImageClickListener,
  startMediaClickListener as startImageClickListener,
  stopMediaClickListener as stopImageClickListener
} from './MediaPlugin';