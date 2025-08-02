import {AbsDiskPluginStore} from "@/modules/disk/abs/AbsDiskPluginStore";
import {DiskSourceView} from "@/types/SourceDisk";
import {DirCoreItem, DirItem, DiskFileLink} from "@/modules/disk/DiskPlugin";
import {DiskFromQuarkOpen} from "@/modules/disk/impl/quark-open/types";
import {SourceDiskDir} from "@/types/SourceDiskDIr";

export class DiskPluginForQuarkOpen extends AbsDiskPluginStore {

  private readonly props: DiskFromQuarkOpen;
  private readonly baseURL = 'https://open-api-drive.quark.cn';

  constructor(source: DiskSourceView) {
    super(source.id);
    this.props = source.data as DiskFromQuarkOpen;
  }

  cp(item: DirItem, destinationFolder: string): Promise<void> {
    return Promise.resolve(undefined);
  }


  mkdir(folder: DirItem, name: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  mv(file: DirItem, folder: DirItem): Promise<void> {
    return Promise.resolve(undefined);
  }

  rename(item: SourceDiskDir, newName: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  rm(item: DirItem): Promise<void> {
    return Promise.resolve(undefined);
  }


  writeFile(file: DirCoreItem): Promise<WritableStream> {
    return Promise.resolve(new WritableStream());
  }

  getFileDownloadLink(file: DirCoreItem): Promise<DiskFileLink> {
    return Promise.resolve({url: ''});
  }

  readDir(parent: SourceDiskDir): Promise<Array<DirItem>> {
    return Promise.resolve([]);
  }

  readFile(file: SourceDiskDir, headers: Record<string, string>, signal: AbortSignal): Promise<Response> {
    return Promise.resolve(new Response('', {headers}));
  }


}