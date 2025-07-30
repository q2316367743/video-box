export type DirItem = {
  // 名字,不带拓展名
  name: string;
  // 拓展名
  extname: string;
  // 路径,唯一标识
  path: string;
  // 所在目录
  folder: string;
  // 类型
  type: 'file' | 'folder' | 'unknow'
  // 文件大小
  size: number;
  // 最后修改时间
  lastModified: number | string;
  // 拓展信息
  expands?: Record<string, any>;
  // 可能存在的封面,忽略
  cover?: string;
};

/**
 * 磁盘插件，主要对磁盘的操作
 */
export interface DiskPlugin {
  /**
   * 读取一个目录下的所有文件和文件夹
   * @param path 目录路径
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
  /**
   * 判断一个路径是否存在
   * @param path
   */
  exists: (path: string) => Promise<boolean>;

  // ------------------------------------ 文件操作 ------------------------------------

  /**
   * 获取文件的下载链接
   * @param file 文件
   */
  getFileDownloadLink: (file: DirItem) => Promise<string>;

  /**
   * 读取一个文件的内容
   * @param file 文件
   */
  readFileAsString: (file: DirItem) => Promise<string>;
  /**
   * 从字符串写入一个文件
   * @param file 文件
   * @param content 文件内容
   */
  writeFileFromString: (file: DirItem, content: string) => Promise<void>;
  /**
   * 将 二进制 写入一个文件
   * @param file 文件
   * @param content 文件内容
   */
  writeFileFromBlob: (file: DirItem, content: Blob) => Promise<void>;


}