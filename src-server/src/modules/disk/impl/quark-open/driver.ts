import {AbsDiskPluginStore} from "@/modules/disk/abs/AbsDiskPluginStore";
import {DiskSourceView} from "@/types/SourceDisk";
import {DirCoreItem, DirItem, DiskFileLink, DiskUploadOption} from "@/modules/disk/DiskPlugin";
import {DiskFromQuarkOpen} from "@/modules/disk/impl/quark-open/types";
import {SourceDiskDir} from "@/types/SourceDiskDIr";

export class DiskPluginForQuarkOpen extends AbsDiskPluginStore {

  private readonly props: DiskFromQuarkOpen;
  private readonly baseURL = 'https://open-api-drive.quark.cn';

  constructor(source: DiskSourceView) {
    super(source.id);
    this.props = source.data as DiskFromQuarkOpen;
  }

  cp(file: SourceDiskDir, folder: SourceDiskDir): Promise<void> {
    return Promise.resolve(undefined);
  }


  mkdir(folder: SourceDiskDir, name: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  mv(file: SourceDiskDir, folder: SourceDiskDir): Promise<void> {
    return Promise.resolve(undefined);
  }

  rename(item: SourceDiskDir, newName: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  rm(item: SourceDiskDir): Promise<void> {
    return Promise.resolve(undefined);
  }


  async writeFile(request: Request, folder: SourceDiskDir, option: DiskUploadOption): Promise<void> {
  }

  getFileDownloadLink(file: DirCoreItem): Promise<DiskFileLink> {
    return Promise.resolve({url: ''});
  }

  list(parent: SourceDiskDir): Promise<Array<DirItem>> {
    return Promise.resolve([]);
  }

  readFile(request: Request, file: SourceDiskDir): Promise<Response> {
    return Promise.resolve(new Response('', {headers: request.headers}));
  }


}