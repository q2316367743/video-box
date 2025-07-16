declare module 'macy' {
  interface MacyOptions {
    container: string | HTMLElement;
    columns: number;
    margin: number;
    trueOrder: boolean;
    waitForImages: boolean;
    useImageLoader: boolean;
    breakAt: Record<number, {
      margin?: {
        x?: number;
        y?: number;
      },
      columns?: number;
    } | number>;
    useOwnImageLoader: boolean;
    onInit: boolean;
    cancelLegacy: boolean;
    useContainerForBreakpoints: boolean;
  }

  export default class Macy {
    constructor(options: Partial<MacyOptions>);

    /**
     * 图像加载后重新计算图像位置的公开方法。
     * @param   waitUntilFinish - 如果为真，则直到所有图像完成加载后才会重新计算。
     */
    recalculateOnImageLoad(waitUntilFinish = false): void;

    /**
     * 在每幅图像加载时或所有图像加载完毕后执行一个函数。
     * @param func      - Function to run on image load
     * @param everyLoad   - If true it will run everytime an image loads
     */
    runOnImageLoad(func: Function, everyLoad = false): void;
    /**
     * 重新计算砌体位置。
     * @param  refresh - Recalculates All elements within the container
     * @param  loaded  - When true it sets the recalculated elements to be marked as complete
     */
    recalculate(refresh = false, loaded = true): void;
    /**
     * 销毁 Macy 实例
     */
    remove(): void;
    /**
     * 使用已定义的选项重新初始化 macy 实例。
     */
    reInit(): void;
    /**
     * Macy事件的事件监听器
     * @param key - Event name to listen to
     * @param func - Function to be called when event happens
     */
    on(key: string, func: Function): void;
    /**
     * 向麦西发出一个事件。
     * @param key {String} - Event name to listen to
     * @param data {Object} - Extra data to be passed to the event object that is passed to the event listener.
     */
    emit(key: string, data: any): void;
  }
}