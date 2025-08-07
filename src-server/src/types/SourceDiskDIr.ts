export interface SourceDiskDir {
  id: string;
  create_time: number;
  update_time: number;
  source_disk_id: string;
  // 唯一标识
  sign: string;
  // 路径
  path: string;
  // 所在文件夹
  folder: string;
  // 类型
  type: 'file' | 'folder' | 'unknow';
  // 名字
  name: string;
  // 拓展名
  extname: string;
  // 大小
  size: number;
  // 最后修改时间，时间戳
  last_modified: number;
  // 是否已缓存，1-是，0-否
  cache: number;
  // 封面
  cover: string;
  // 拓展信息
  expands: string;
}