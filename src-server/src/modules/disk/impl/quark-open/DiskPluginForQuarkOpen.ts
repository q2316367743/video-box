import {AbsDiskPluginStore} from "@/modules/disk/abs/AbsDiskPluginStore";
import {DiskSourceView} from "@/types/SourceDisk";
import {DirCoreItem, DirItem, DiskFileLink} from "@/modules/disk/DiskPlugin";
import {DiskFromQuarkOpen} from "@/modules/disk/impl/quark-open/types";

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

  exists(path: string): Promise<boolean> {
    return Promise.resolve(false);
  }


  mkdir(folder: DirItem, name: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  mv(item: DirItem, newPath: string): Promise<void> {
    return Promise.resolve(undefined);
  }


  readFileAsString(file: DirItem): Promise<string> {
    return Promise.resolve("");
  }

  rename(item: DirItem, newName: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  rm(item: DirItem): Promise<void> {
    return Promise.resolve(undefined);
  }

  writeFileFromBlob(file: DirItem, content: Blob): Promise<void> {
    return Promise.resolve(undefined);
  }

  writeFileFromString(file: DirItem, content: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  async readFile(file: DirCoreItem, headers: Record<string, string>): Promise<Response> {
    return new Response('');
  }

  writeFile(file: DirCoreItem): Promise<WritableStream> {
    return Promise.resolve(new WritableStream());
  }

  getFileDownloadLink(file: DirCoreItem): Promise<DiskFileLink> {
    return Promise.resolve({url: ''});
  }

  readDir(path: string): Promise<Array<DirItem>> {
    return Promise.resolve([]);
  }

}