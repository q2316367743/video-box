import {FileState} from "@/modules/disk/DiskPlugin";

export function findCover(name: string, files: Array<FileState>): Array<string> {
  return files.filter(f =>
    f.name.startsWith(name) &&
    (f.extname === 'jpg' || f.extname === 'jpeg' || f.extname === 'png'))
    .map(f => f.path);
}