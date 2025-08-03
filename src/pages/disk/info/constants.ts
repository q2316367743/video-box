import {DirItem} from "@/apis/plugin/disk/list.ts";

export const videoTypes = ['mp4'];
export const imageTypes = ['jpg', 'jpeg', 'png', 'webp', 'git'];
// 支持高亮的代码文件扩展名
export const CODE_EXTENSIONS = [
  'js', 'jsx', 'ts', 'tsx', 'vue',
  'html', 'htm', 'css', 'scss', 'sass', 'less',
  'json', 'xml', 'yaml', 'yml',
  'py', 'php', 'rb', 'go', 'rs', 'c', 'cpp', 'cc', 'cxx', 'h', 'hpp',
  'java', 'kt', 'scala', 'swift',
  'sh', 'bash', 'zsh', 'fish',
  'sql', 'dockerfile', 'makefile', 'toml',
  'md', 'markdown',
  'ini', 'cfg', 'conf', 'env',
  'r', 'pl', 'lua', 'dart', 'elm', 'clj', 'ex', 'exs', 'erl', 'hs', 'txt'
];
// 音频文件扩展名
export const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'alac'];

export interface DiskInfoInstance {
  setPath: (item: DirItem) => void;
  current: Ref<DirItem | undefined>;
  setDragPath: (path: string) => void;
  getDragPath: () => string | undefined;
}

export const diskInfoKey = Symbol() as InjectionKey<DiskInfoInstance>