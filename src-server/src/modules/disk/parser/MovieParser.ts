import {DirItem, DiskPlugin} from "@/modules/disk/DiskPlugin";
import {findCover} from "@/modules/disk/parser/CommonParser";
import {defaultDiskProgram, DiskProgram} from "@/types/SourceDiskEntry";
import {group, map} from "@/utils/ArrayUtil";
import {parseNfo} from "@/utils/file/NfoUtil";

async function parseMovieLoop(res: Array<DirItem>, plugin: DiskPlugin, progress: Map<string, number>, programs: Array<DiskProgram>) {
  const folders = new Array<DirItem>()
  const files = new Array<DirItem>();
  res.forEach(f => {
    if (f.type === 'folder') {
      folders.push(f);
    } else if (f.type === 'file') {
      files.push(f);
    }
  });
  // 解析目录
  for (const f of folders) {
    const files = await plugin.list(f as any);
    await parseMovieLoop(files, plugin, progress, programs);
  }
  // 解析文件
  const nameGroupMap = group(files, 'name');
  for (let [name, subFiles] of nameGroupMap.entries()) {
    const extMap = map(subFiles, 'extname');
    // mp4/flv/mkv
    // 设置视频文件
    const video = extMap.get('mp4') || extMap.get('flv') || extMap.get('mkv');
    if (video) {
      // 寻找nfo
      const nfo = extMap.get('nfo');
      let p: DiskProgram;
      if (nfo) {
        // TODO: 存在nfo
        const nfoContent = await plugin.readFile(nfo as any, {} as any).then(res => res.text());
        p = parseNfo(nfoContent, 'movie');
      } else {
        // 构造默认
        p = defaultDiskProgram(name);
      }
      const covers = findCover(name, files);
      p.cover = covers[0] || '';
      p.sessions.push({
        id: 'Session 1',
        description: "",
        name: 'Session 1',
        chapters: [{
          name: name,
          description: '',
          cover: p.cover,
          id: video.path,
          path: video.path
        }]
      })
      programs.push(p);
    }
  }

}

export async function parseMovie(plugin: DiskPlugin, progress: Map<string, number>): Promise<Array<DiskProgram>> {
  const files = await plugin.list({} as any);
  const programs = new Array<DiskProgram>();
  await parseMovieLoop(files, plugin, progress, programs);
  return programs
}