import { reactive } from 'vue'

export interface DragState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  isDragging: boolean
  startTime: number
  deltaX: number
  deltaY: number
}

export function useDragHandler(onSwipeLeft: () => void) {
  const dragState = reactive<DragState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,
    startTime: 0,
    deltaX: 0,
    deltaY: 0
  })

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    dragState.startX = touch.clientX
    dragState.startY = touch.clientY
    dragState.currentX = touch.clientX
    dragState.currentY = touch.clientY
    dragState.isDragging = true
    dragState.startTime = Date.now()
    dragState.deltaX = 0
    dragState.deltaY = 0
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!dragState.isDragging) return
    
    const touch = e.touches[0]
    dragState.currentX = touch.clientX
    dragState.currentY = touch.clientY
    dragState.deltaX = dragState.currentX - dragState.startX
    dragState.deltaY = dragState.currentY - dragState.startY
    
    // 阻止默认滚动行为
    if (Math.abs(dragState.deltaX) > 10) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = () => {
    if (!dragState.isDragging) return
    
    const deltaTime = Date.now() - dragState.startTime
    const velocity = Math.abs(dragState.deltaX) / deltaTime
    
    // 判断是否触发左滑
    const shouldSwipe = (dragState.deltaX < -100 || (dragState.deltaX < 0 && velocity > 0.5))
    
    if (shouldSwipe) {
      onSwipeLeft()
    }
    
    // 重置拖拽状态
    resetDragState()
  }

  const handleMouseDown = (e: MouseEvent) => {
    dragState.startX = e.clientX
    dragState.startY = e.clientY
    dragState.currentX = e.clientX
    dragState.currentY = e.clientY
    dragState.isDragging = true
    dragState.startTime = Date.now()
    dragState.deltaX = 0
    dragState.deltaY = 0
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragState.isDragging) return
    
    dragState.currentX = e.clientX
    dragState.currentY = e.clientY
    dragState.deltaX = dragState.currentX - dragState.startX
    dragState.deltaY = dragState.currentY - dragState.startY
  }

  const handleMouseUp = () => {
    if (!dragState.isDragging) return
    
    const deltaTime = Date.now() - dragState.startTime
    const velocity = Math.abs(dragState.deltaX) / deltaTime
    
    // 只支持左滑
    const shouldSwipe = (dragState.deltaX < -100 || (dragState.deltaX < 0 && velocity > 0.5))
    
    if (shouldSwipe) {
      onSwipeLeft()
    }
    
    resetDragState()
  }

  const resetDragState = () => {
    dragState.isDragging = false
    dragState.deltaX = 0
    dragState.deltaY = 0
  }

  return {
    dragState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  }
}