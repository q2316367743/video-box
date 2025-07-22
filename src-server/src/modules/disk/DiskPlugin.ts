export interface FileState {
  // 名字,不带拓展名
  name: string;
  // 路径,唯一标识
  path: string;
  // 拓展名
  extname: string;
  // 是否是文件
  isFile: boolean;
  // 是否是目录
  isDirectory: boolean;
  // 文件大小
  size: number;
  // 最后修改时间
  lastModified: number | string;
  // 拓展信息
  expands?: Record<string, any>;
  // 可能存在的封面,忽略
  cover?: string;
}

/**
 * 磁盘插件，主要对磁盘的操作
 */
export interface DiskPlugin {
  /**
   * 读取一个目录下的所有文件和文件夹
   * @param path 目录路径
   */
  readDir: (path: string) => Promise<Array<FileState>>;
  /**
   * 读取一个文件的内容
   * @param path 文件路径
   */
  readFileAsString: (path: string) => Promise<string>;

  /**
   * 重命名一个文件
   * @param path 文件路径
   * @param newName 新文件名
   */
  rename(path: string, newName: string): Promise<void>;
  /**
   * 移动一个文件
   * @param oldPath 旧路径
   * @param newPath 新路径
   */
  mv: (oldPath: string, newPath: string) => Promise<void>;
  /**
   * 复制一个文件
   * @param path 文件路径
   * @param destinationFolder 新目录
   */
  cp: (path: string, destinationFolder: string) => Promise<void>;
  /**
   * 删除一个文件
   * @param path 文件路径
   */
  rm: (path: string) => Promise<void>;
  /**
   * 创建一个目录
   * @param path 目录路径
   */
  mkdir: (path: string) => Promise<void>;
  /**
   * 从字符串写入一个文件
   * @param path 文件路径
   * @param content 文件内容
   */
  writeFileFromString: (path: string, content: string) => Promise<void>;
  /**
   * 从 Blob 写入一个文件
   * @param path 文件路径
   * @param content 文件内容
   */
  writeFileFromBlob: (path: string, content: Blob) => Promise<void>;
  /**
   * 判断一个路径是否存在
   * @param path
   */
  exists: (path: string) => Promise<boolean>;

  /**
   * 获取文件的下载链接
   * @param item 文件路径
   */
  getFileDownloadLink: (item: string) => Promise<string>;

  /**
   * 获取文件的下载链接
   * @param items 文件路径
   */
  getFileDownloadLinks: (items: string[]) => Promise<string[]>;

}