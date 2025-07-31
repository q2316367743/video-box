export interface DirCoreItem {
  // 路径，当前目录项的路径
  path: string;
  // 签名
  sign: string;
}

export interface DirItem<T extends Record<string, any> = Record<string, any>> extends DirCoreItem {
  // 名字，
  name: string;
  // 类型
  type: 'file' | 'folder' | 'unknow';
  // 所在目录
  folder: string;
  // 拓展名
  extname?: string;
  // 文件大小
  size?: number;
  // 最后修改时间
  lastModified?: number | string;
  // 拓展信息
  expands?: T;
  // 可能存在的封面,忽略
  cover?: string;
}

export interface DiskFileLink {
  url: string;
  headers?: Record<string, any>;
  concurrency?: number;
  part_size?: number;
  // 对于本地文件系统，这是非常有用的
  file?: File;
  // 转码视频、缩略图。暂时作用未知
  contentLength?: number;
}

/**
 * 磁盘插件，主要对磁盘的操作
 */
export interface DiskPlugin {
  /**
   * 读取一个目录下的所有文件和文件夹
   * @param item 目录
   */
  readDir: (path: string) => Promise<Array<DirItem>>;

  /**
   * 重命名一个文件或文件夹
   * @param item 目录项
   * @param newName 新文件名
   */
  rename: (item: DirItem, newName: string) => Promise<void>;
  /**
   * 移动一个或文件夹
   * @param item 目录项
   * @param newPath 新路径
   */
  mv: (item: DirItem, newPath: string) => Promise<void>;
  /**
   * 复制一个文件或文件夹
   * @param item 目录项
   * @param destinationFolder 新目录
   */
  cp: (item: DirItem, destinationFolder: string) => Promise<void>;
  /**
   * 删除一个文件或文件夹
   * @param item 目录项
   */
  rm: (item: DirItem) => Promise<void>;
  /**
   * 创建一个目录
   * @param folder 目录所在文件夹
   */
  mkdir: (folder: DirItem, name: string) => Promise<void>;

  // ------------------------------------ 文件操作 ------------------------------------

  /**
   * 获取文件的下载链接
   * @param file 文件
   */
  getFileDownloadLink: (file: DirCoreItem) => Promise<DiskFileLink>;

  // ------------------------------------ 高级操作 ------------------------------------

  /**
   * 读取一个文件
   * @param file 文件
   * @param headers 请求头
   */
  readFile: (file: DirCoreItem, headers: Record<string, string>) => Promise<Response>;
  /**
   * 写入一个文件
   * @param file 文件
   */
  writeFile: (file: DirCoreItem) => Promise<WritableStream>;


}