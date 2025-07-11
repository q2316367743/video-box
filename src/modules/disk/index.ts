import {DiskDriver, DiskSource, DiskSourceForm} from "@/entities/disk/DiskSource";
import {DiskEntry, DiskProgram} from "@/entities/disk/DiskEntry";
import {DiskPlugin} from "@/modules/disk/DiskPlugin";
import {DiskPluginForAList} from "@/modules/disk/impl/DiskPluginForAList";
import {DiskPluginForWebDAV} from "@/modules/disk/impl/DiskPluginForWebDAV";
import {parseMovie} from "@/modules/disk/parser/MovieParser";

export function buildDiskPlugin(source: DiskSourceForm<DiskDriver>): DiskPlugin {
  switch (source.driver) {
    case "A_LIST":
      return new DiskPluginForAList(source as DiskSource<"A_LIST">);
    case "WEB_DAV":
      return new DiskPluginForWebDAV(source as DiskSource<"WEB_DAV">);
    default:
      throw new Error(`不支持的磁盘驱动: ${source.driver}`);
  }
}


/**
 * TODO: 刷新云盘源
 *
 * @param source 云盘源
 * @param progress 进度
 */
export async function refreshDiskEntry(source: DiskSource<DiskDriver>, progress: Map<string, number>): Promise<DiskEntry> {
  const plugin = buildDiskPlugin(source);
  let programs: Array<DiskProgram>;
  if (source.type === 'movie') {
    programs = await parseMovie(plugin, progress);
  } else if (source.type === 'tvshow') {
    programs = [];
  } else {
    throw new Error('不支持的磁盘类型')
  }
  return {
    id: source.id,
    programs
  }
}