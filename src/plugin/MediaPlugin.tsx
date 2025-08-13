import { createVNode, defineComponent, render, ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue';
import {CloseIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon, SoundIcon, SoundMute1Icon, SoundHighIcon, SoundUpIcon, SoundDownIcon} from 'tdesign-icons-vue-next';
import { SourceSubscribeMedia } from '@/types/SourceSubscribe';
import { detectMediaType, getMediaTypeName, formatTime } from '@/utils/mediaUtils';
import styles from './MediaPlugin.module.css';
import { Button } from 'tdesign-vue-next';

// 组件属性类型定义
interface MediaPreviewProps {
  medias: SourceSubscribeMedia[];
  initialIndex?: number;
  onClose?: () => void;
}

// 多媒体预览组件
const MediaPreview = defineComponent<MediaPreviewProps>({
  props: {
    medias: {
      type: Array as () => SourceSubscribeMedia[],
      required: true,
      default: () => []
    },
    initialIndex: {
      type: Number,
      default: 0
    },
    onClose: {
      type: Function,
      default: () => {}
    }
  },
  setup(props) {
    const currentIndex = ref(props.initialIndex || 0);
    const isVisible = ref(true);
    const mediaRef = ref<HTMLImageElement | HTMLVideoElement | HTMLAudioElement>();
    const containerRef = ref<HTMLDivElement>();
    const isSmallMedia = ref(false);
    const mediaLoaded = ref(false);
    const showControls = ref(false);
    
    // 图片缩放相关状态
    const scale = ref(1);
    const translateX = ref(0);
    const translateY = ref(0);
    const isDragging = ref(false);
    const dragStartX = ref(0);
    const dragStartY = ref(0);
    const lastTranslateX = ref(0);
    const lastTranslateY = ref(0);
    
    // 视频/音频播放状态
    const isPlaying = ref(false);
    const currentTime = ref(0);
    const duration = ref(0);
    const volume = ref(1);
    const isMuted = ref(false);

    // 当前显示的媒体对象
    const currentMedia = computed(() => {
      return props.medias[currentIndex.value];
    });

    // 当前媒体类型
    const currentMediaType = computed(() => {
      if (!currentMedia.value) return 1;
      return currentMedia.value.type || detectMediaType(currentMedia.value.url);
    });

    // 检测媒体是否太小，需要调整按钮位置
    const checkMediaSize = async () => {
      await nextTick();
      if (mediaRef.value && containerRef.value) {
        const media = mediaRef.value;
        const mediaRect = media.getBoundingClientRect();
        const containerRect = containerRef.value.getBoundingClientRect();
        
        // 更合理的小媒体判断条件
        // 1. 媒体宽度小于400px或高度小于300px
        const isSmallSize = mediaRect.width < 400 || mediaRect.height < 300;
        
        // 2. 媒体占容器比例较小（小于50%）
        const widthRatio = mediaRect.width / containerRect.width;
        const heightRatio = mediaRect.height / containerRect.height;
        const isSmallRatio = widthRatio < 0.5 || heightRatio < 0.5;
        
        // 3. 检查导航按钮是否会与媒体重叠
        const navButtonSize = 56;
        const navButtonMargin = 20;
        const totalNavWidth = navButtonSize + navButtonMargin * 2;
        const wouldOverlapNav = mediaRect.width < totalNavWidth * 2;
        
        // 满足任一条件即认为是小媒体
        isSmallMedia.value = isSmallSize || isSmallRatio || wouldOverlapNav;
      }
    };

    // 重置图片缩放状态
    const resetZoom = () => {
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      lastTranslateX.value = 0;
      lastTranslateY.value = 0;
    };

    // 媒体加载完成处理
    const handleMediaLoad = () => {
      mediaLoaded.value = true;
      checkMediaSize();
      preloadMedias();
      resetZoom(); // 重置缩放状态
      
      // 如果是视频或音频，设置时长
      if (currentMediaType.value === 2 || currentMediaType.value === 3) {
        const mediaElement = mediaRef.value as HTMLVideoElement | HTMLAudioElement;
        if (mediaElement) {
          duration.value = mediaElement.duration || 0;
        }
      }
    };

    // 关闭预览
    const closePreview = () => {
      // 停止播放
      if (mediaRef.value && (currentMediaType.value === 2 || currentMediaType.value === 3)) {
        const mediaElement = mediaRef.value as HTMLVideoElement | HTMLAudioElement;
        mediaElement.pause();
      }
      
      isVisible.value = false;
      props.onClose?.();
    };

    // 切换到上一个媒体
    const prevMedia = () => {
      stopCurrentMedia();
      mediaLoaded.value = false;
      resetZoom(); // 重置缩放状态
      if (currentIndex.value > 0) {
        currentIndex.value--;
      } else {
        currentIndex.value = props.medias.length - 1;
      }
    };

    // 切换到下一个媒体
    const nextMedia = () => {
      stopCurrentMedia();
      mediaLoaded.value = false;
      resetZoom(); // 重置缩放状态
      if (currentIndex.value < props.medias.length - 1) {
        currentIndex.value++;
      } else {
        currentIndex.value = 0;
      }
    };

    // 跳转到指定媒体
    const jumpToMedia = (index: number) => {
      if (index >= 0 && index < props.medias.length) {
        stopCurrentMedia();
        mediaLoaded.value = false;
        resetZoom(); // 重置缩放状态
        currentIndex.value = index;
      }
    };

    // 停止当前媒体播放
    const stopCurrentMedia = () => {
      if (mediaRef.value && (currentMediaType.value === 2 || currentMediaType.value === 3)) {
        const mediaElement = mediaRef.value as HTMLVideoElement | HTMLAudioElement;
        mediaElement.pause();
        isPlaying.value = false;
      }
    };

    // 播放/暂停切换
    const togglePlayPause = () => {
      if (currentMediaType.value === 1) return; // 图片不需要播放控制
      
      const mediaElement = mediaRef.value as HTMLVideoElement | HTMLAudioElement;
      if (!mediaElement) return;
      
      if (isPlaying.value) {
        mediaElement.pause();
      } else {
        mediaElement.play();
      }
    };

    // 音量控制
    const toggleMute = () => {
      if (currentMediaType.value === 1) return;
      
      const mediaElement = mediaRef.value as HTMLVideoElement | HTMLAudioElement;
      if (!mediaElement) return;
      
      isMuted.value = !isMuted.value;
      mediaElement.muted = isMuted.value;
    };

    // 增加音量
    const increaseVolume = () => {
      if (currentMediaType.value === 1) return;
      
      const mediaElement = mediaRef.value as HTMLVideoElement | HTMLAudioElement;
      if (!mediaElement) return;
      
      const newVolume = Math.min(1, volume.value + 0.1);
      volume.value = newVolume;
      mediaElement.volume = newVolume;
      
      // 如果增加音量，自动取消静音
      if (isMuted.value) {
        isMuted.value = false;
        mediaElement.muted = false;
      }
    };

    // 减少音量
    const decreaseVolume = () => {
      if (currentMediaType.value === 1) return;
      
      const mediaElement = mediaRef.value as HTMLVideoElement | HTMLAudioElement;
      if (!mediaElement) return;
      
      const newVolume = Math.max(0, volume.value - 0.1);
      volume.value = newVolume;
      mediaElement.volume = newVolume;
      
      // 如果音量为0，自动静音
      if (newVolume === 0) {
        isMuted.value = true;
        mediaElement.muted = true;
      }
    };

    // 获取音量图标
    const getVolumeIcon = () => {
      if (isMuted.value || volume.value === 0) {
        return SoundMute1Icon;
      } else if (volume.value > 0.7) {
        return SoundHighIcon;
      } else {
        return SoundIcon;
      }
    };

    // 进度条控制
    const handleProgressChange = (event: Event) => {
      if (currentMediaType.value === 1) return;
      
      const mediaElement = mediaRef.value as HTMLVideoElement | HTMLAudioElement;
      const input = event.target as HTMLInputElement;
      if (!mediaElement) return;
      
      const newTime = (parseFloat(input.value) / 100) * duration.value;
      mediaElement.currentTime = newTime;
      currentTime.value = newTime;
    };

    // 媒体播放事件监听
    const setupMediaEvents = () => {
      if (currentMediaType.value === 1) return;
      
      const mediaElement = mediaRef.value as HTMLVideoElement | HTMLAudioElement;
      if (!mediaElement) return;
      
      // 设置默认音量和静音状态
      mediaElement.volume = volume.value;
      mediaElement.muted = isMuted.value;
      
      mediaElement.addEventListener('play', () => {
        isPlaying.value = true;
      });
      
      mediaElement.addEventListener('pause', () => {
        isPlaying.value = false;
      });
      
      mediaElement.addEventListener('timeupdate', () => {
        currentTime.value = mediaElement.currentTime;
      });
      
      mediaElement.addEventListener('loadedmetadata', () => {
        duration.value = mediaElement.duration;
      });
      
      mediaElement.addEventListener('volumechange', () => {
        volume.value = mediaElement.volume;
        isMuted.value = mediaElement.muted;
      });
    };

    // 媒体加载错误处理
    const handleMediaError = (event: Event) => {
      const media = event.target as HTMLElement;
      console.warn('媒体加载失败:', currentMedia.value?.url);
      media.style.display = 'none';
    };

    // 媒体预加载优化
    const preloadMedias = () => {
      props.medias.forEach((media, index) => {
        if (Math.abs(index - currentIndex.value) <= 1) {
          if (media.type === 1 || detectMediaType(media.url) === 1) {
            const img = new Image();
            img.src = media.url;
          }
        }
      });
    };

    // 键盘事件处理
    const handleKeydown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          closePreview();
          break;
        case 'ArrowLeft':
          prevMedia();
          break;
        case 'ArrowRight':
          nextMedia();
          break;
        case ' ':
          event.preventDefault();
          togglePlayPause();
          break;
        case '0': // 数字0键重置缩放
          if (currentMediaType.value === 1) {
            resetZoom();
          }
          break;
      }
    };

    // 点击遮罩关闭
    const handleMaskClick = (event: MouseEvent) => {
      if (event.target === event.currentTarget) {
        closePreview();
      }
    };

    // 处理图片滚轮缩放
    const handleWheel = (event: WheelEvent) => {
      // 只对图片类型处理滚轮缩放
      if (currentMediaType.value !== 1) return;
      
      event.preventDefault();
      
      // 获取图片元素
      const img = mediaRef.value as HTMLImageElement;
      if (!img) return;
      
      // 获取图片的实际尺寸和位置
      const rect = img.getBoundingClientRect();
      
      // 计算鼠标在图片上的相对位置（考虑当前的缩放和平移）
      const mouseX = (event.clientX - rect.left) / scale.value - translateX.value / scale.value;
      const mouseY = (event.clientY - rect.top) / scale.value - translateY.value / scale.value;
      
      // 缩放比例变化，向下滚动缩小，向上滚动放大
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      const oldScale = scale.value;
      const newScale = Math.max(0.1, Math.min(10, oldScale + delta));
      
      if (newScale !== oldScale) {
        // 更新缩放值
        scale.value = newScale;
        
        // 计算新的平移值，使鼠标指向的点保持在相同位置
        // 公式: 新位置 = 鼠标位置 - (鼠标位置 - 旧位置) * (新缩放 / 旧缩放)
        translateX.value = (event.clientX - rect.left) - mouseX * newScale;
        translateY.value = (event.clientY - rect.top) - mouseY * newScale;
        
        // 更新最后的位移值
        lastTranslateX.value = translateX.value;
        lastTranslateY.value = translateY.value;
      }
    };

    // 处理图片拖动开始
    const handleMouseDown = (event: MouseEvent) => {
      // 只对图片类型且已缩放的情况处理拖动
      if (currentMediaType.value !== 1 || scale.value <= 1) return;
      
      event.preventDefault();
      isDragging.value = true;
      dragStartX.value = event.clientX;
      dragStartY.value = event.clientY;
    };

    // 处理图片拖动
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging.value) return;
      
      const deltaX = event.clientX - dragStartX.value;
      const deltaY = event.clientY - dragStartY.value;
      
      translateX.value = lastTranslateX.value + deltaX;
      translateY.value = lastTranslateY.value + deltaY;
    };

    // 处理图片拖动结束
    const handleMouseUp = () => {
      if (isDragging.value) {
        isDragging.value = false;
        lastTranslateX.value = translateX.value;
        lastTranslateY.value = translateY.value;
      }
    };

    // 双击重置缩放
    const handleDoubleClick = (event: MouseEvent) => {
      if (currentMediaType.value === 1) {
        event.preventDefault();
        resetZoom();
      }
    };

    // 生命周期
    onMounted(() => {
      document.addEventListener('keydown', handleKeydown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.overflow = 'hidden';
      showControls.value = true;
    });

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.overflow = '';
    });

    // 监听媒体类型变化，重置缩放状态
    watch(currentMediaType, () => {
      resetZoom();
    });

    // 获取图片样式，包括缩放和位移
    const getImageStyle = () => {
      if (currentMediaType.value !== 1) return {};
      
      return {
        transform: `scale(${scale.value}) translate(${translateX.value / scale.value}px, ${translateY.value / scale.value}px)`,
        cursor: scale.value > 1 ? (isDragging.value ? 'grabbing' : 'grab') : 'default',
        transition: isDragging.value ? 'none' : 'transform 0.1s ease'
      };
    };

    // 渲染不同类型的媒体元素
    const renderMediaElement = () => {
      if (!currentMedia.value) return null;
      
      const mediaType = currentMediaType.value;
      const media = currentMedia.value;
      
      switch (mediaType) {
        case 1: // 图片
          return (
            <img
              ref={mediaRef}
              src={media.url}
              alt={media.alt || `图片 ${currentIndex.value + 1}`}
              class={[
                styles.image,
                { [styles.imageSmall]: isSmallMedia.value }
              ]}
              style={getImageStyle()}
              onError={handleMediaError}
              onLoad={() => {
                handleMediaLoad();
                setupMediaEvents();
              }}
              onWheel={handleWheel}
              onMousedown={handleMouseDown}
              onDblclick={handleDoubleClick}
            />
          );
          
        case 2: // 视频
          return (
            <video
              ref={mediaRef}
              src={media.url}
              class={[
                styles.video,
                { [styles.videoSmall]: isSmallMedia.value }
              ]}
              controls={false}
              onError={handleMediaError}
              onLoadeddata={() => {
                handleMediaLoad();
                setupMediaEvents();
              }}
            />
          );
          
        case 3: // 音频
          return (
            <div class={styles.audioContainer}>
              <audio
                ref={mediaRef}
                src={media.url}
                onError={handleMediaError}
                onLoadeddata={() => {
                  handleMediaLoad();
                  setupMediaEvents();
                }}
              />
              <div class={styles.audioVisual}>
                <div class={styles.audioIcon}>🎵</div>
                <div class={styles.audioInfo}>
                  <div class={styles.audioTitle}>{media.alt || '音频文件'}</div>
                  <div class={styles.audioTime}>
                    {formatTime(currentTime.value)} / {formatTime(duration.value)}
                  </div>
                </div>
              </div>
            </div>
          );
          
        default:
          return null;
      }
    };

    // 渲染媒体控制栏
    const renderMediaControls = () => {
      if (currentMediaType.value === 1) {
        // 对于图片类型，不再在这里显示缩放信息和重置按钮
        return null;
      }
      
      // 视频/音频控制栏
      const progress = duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0;
      const VolumeIcon = getVolumeIcon();
      
      return (
        <div class={styles.mediaControls}>
          <button class={styles.playButton} onClick={togglePlayPause}>
            {isPlaying.value ? <PauseIcon size="24" /> : <PlayIcon size="24" />}
          </button>
          
          <div class={styles.progressContainer}>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              class={styles.progressBar}
              onChange={handleProgressChange}
            />
          </div>
          
          <div class={styles.timeDisplay}>
            {formatTime(currentTime.value)} / {formatTime(duration.value)}
          </div>
          
          {/* 音量控制区域 */}
          <div class={styles.volumeControls}>
            <button class={styles.volumeButton} onClick={decreaseVolume} title="减少音量">
              <SoundDownIcon size="18" />
            </button>
            
            <button class={styles.volumeButton} onClick={toggleMute} title={isMuted.value ? "取消静音" : "静音"}>
              <VolumeIcon size="20" />
            </button>
            
            <button class={styles.volumeButton} onClick={increaseVolume} title="增加音量">
              <SoundUpIcon size="18" />
            </button>
            
            <div class={styles.volumeIndicator}>
              {Math.round(isMuted.value ? 0 : volume.value * 100)}%
            </div>
          </div>
        </div>
      );
    };

    return () => {
      if (!isVisible.value) return null;

      return (
        <div 
          class={styles.overlay} 
          onClick={handleMaskClick}
        >
          {/* 固定在屏幕左上角的媒体计数器 */}
          {mediaLoaded.value && (
            <div class={styles.fixedCounter}>
              {props.medias.length > 1 && (
                <span>{currentIndex.value + 1} / {props.medias.length} - {getMediaTypeName(currentMediaType.value)}</span>
              )}
              {currentMediaType.value === 1 && scale.value !== 1 && (
                <span class={styles.zoomIndicator}>
                  {Math.round(scale.value * 100)}%
              <Button 
                class={[styles.resetZoomButton, 'ml-12px']} 
                onClick={resetZoom}
                size={'small'}
              >
                重置
              </Button>
                </span>
              )}
            </div>
          )}
          {/* 关闭按钮 */}
          <button 
            class={[
              styles.close, 
              styles.closeVisible,
              { [styles.closeExternal]: isSmallMedia.value }
            ]} 
            onClick={closePreview}
            title="关闭预览"
            aria-label="关闭预览"
          >
            <CloseIcon size="24" />
          </button>

          {/* 主媒体显示区域 */}
          <div class={styles.main}>
            {/* 左切换按钮 */}
            {props.medias.length > 1 && (
              <button 
                class={[
                  styles.nav, 
                  styles.navLeft,
                  styles.navVisible,
                  { [styles.navExternal]: isSmallMedia.value }
                ]} 
                onClick={prevMedia}
                title="上一个媒体"
                aria-label="上一个媒体"
              >
                <ChevronLeftIcon size="32" />
              </button>
            )}

            {/* 当前媒体容器 */}
            <div 
              ref={containerRef}
              class={[
                styles.mediaContainer,
                { [styles.mediaContainerSmall]: isSmallMedia.value }
              ]}
            >
              {renderMediaElement()}
              
              {/* 媒体计数器 - 移除了原来的位置 */}
            </div>

            {/* 右切换按钮 */}
            {props.medias.length > 1 && (
              <button 
                class={[
                  styles.nav, 
                  styles.navRight,
                  styles.navVisible,
                  { [styles.navExternal]: isSmallMedia.value }
                ]} 
                onClick={nextMedia}
                title="下一个媒体"
                aria-label="下一个媒体"
              >
                <ChevronRightIcon size="32" />
              </button>
            )}
          </div>

          {/* 媒体控制栏 */}
          {renderMediaControls()}

          {/* 底部缩略图导航 */}
          {props.medias.length > 1 && (
            <div 
              class={[
                styles.thumbnails,
                styles.thumbnailsVisible
              ]}
            >
              <div class={styles.thumbnailsContainer}>
                {props.medias.map((media, index) => (
                  <div
                    key={index}
                    class={[
                      styles.thumbnail,
                      { [styles.thumbnailActive]: index === currentIndex.value }
                    ]}
                    onClick={() => jumpToMedia(index)}
                  >
                    {media.type === 1 || detectMediaType(media.url) === 1 ? (
                      <img src={media.url} alt={`缩略图 ${index + 1}`} />
                    ) : (
                      <div class={styles.thumbnailPlaceholder}>
                        {getMediaTypeName(media.type || detectMediaType(media.url))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    };
  }
});

// 插件主函数
export const showMediaPlugin = (medias: SourceSubscribeMedia[], initialIndex: number = 0, onClose?: () => void) => {
  if (!medias || medias.length === 0) {
    console.warn('showMediaPlugin: medias数组不能为空');
    return () => {};
  }

  const wrapper = document.createElement('div');

  function destroySelf() {
    render(null, wrapper);
    wrapper.remove();
    onClose?.();
  }

  const component = createVNode(MediaPreview, {
    medias,
    initialIndex,
    onClose: destroySelf
  });

  document.body.appendChild(wrapper);
  render(component, wrapper);

  return destroySelf;
};

// 兼容旧版本的图片预览函数
export const showImagesPlugin = (urls: string[], initialIndex: number = 0, onClose?: () => void) => {
  const medias: SourceSubscribeMedia[] = urls.map((url, index) => ({
    id: `temp-${index}`,
    created_at: Date.now(),
    subscribe_id: '',
    record_id: '',
    alt: `图片 ${index + 1}`,
    url,
    type: 1,
    order: index
  }));
  
  return showMediaPlugin(medias, initialIndex, onClose);
};

// 自动监听content-text元素的媒体点击事件
export const initMediaClickListener = () => {
  const handleMediaClick = (event: Event) => {
    const target = event.target as HTMLElement;

    // 检查点击的是否是媒体元素
    if (target.tagName === 'IMG' || target.tagName === 'VIDEO' || target.tagName === 'AUDIO') {
      const contentTextElement = target.closest('.content-text') || target.closest('[class*="content-text"]');

      if (contentTextElement) {
        // 获取该元素内的所有媒体
        const mediaElements = contentTextElement.querySelectorAll('img, video, audio');
        const medias: SourceSubscribeMedia[] = [];
        let clickedIndex = 0;

        mediaElements.forEach((element, index) => {
          const src = element.getAttribute('src');
          if (src) {
            const mediaType = element.tagName === 'IMG' ? 1 : 
                            element.tagName === 'VIDEO' ? 2 : 3;
            
            medias.push({
              id: `auto-${index}`,
              created_at: Date.now(),
              subscribe_id: '',
              record_id: '',
              alt: element.getAttribute('alt') || `媒体 ${index + 1}`,
              url: src,
              type: mediaType,
              order: index
            });
            
            if (element === target) {
              clickedIndex = index;
            }
          }
        });

        if (medias.length > 0) {
          // 阻止默认行为
          event.preventDefault();
          event.stopPropagation();

          // 调用媒体预览
          showMediaPlugin(medias, clickedIndex, () => {
            console.log('媒体预览已关闭');
          });
        }
      }
    }
  };

  // 使用事件委托监听整个文档的点击事件
  document.addEventListener('click', handleMediaClick, true);

  // 返回清理函数
  return () => {
    document.removeEventListener('click', handleMediaClick, true);
  };
};

// 自动初始化监听器（可选）
let listenerCleanup: (() => void) | null = null;

export const startMediaClickListener = () => {
  if (!listenerCleanup) {
    listenerCleanup = initMediaClickListener();
    console.log('媒体点击监听器已启动');
  }
};

export const stopMediaClickListener = () => {
  if (listenerCleanup) {
    listenerCleanup();
    listenerCleanup = null;
    console.log('媒体点击监听器已停止');
  }
};