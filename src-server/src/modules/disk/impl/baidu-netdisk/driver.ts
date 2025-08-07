import {AbsDiskPluginStore} from "@/modules/disk/abs/AbsDiskPluginStore";
import {DiskSourceView} from "@/types/SourceDisk";
import {SourceDiskDir} from "@/types/SourceDiskDIr";
import {DirItem, DiskFileLink, DiskUploadOption} from "@/modules/disk/DiskPlugin";
import {DiskFormBaiduNetDisk} from "@/modules/disk/impl/baidu-netdisk/props";
import {URL} from "url";
import {
  baiduNetDiskCreate,
  baiduNetDiskGet,
  baiduNetDiskGetFiles,
  baiduNetDiskLinkCrack,
  baiduNetDiskLinkCrackVideo, baiduNetDiskLinkOfficial, baiduNetDiskManage
} from "@/modules/disk/impl/baidu-netdisk/utils";
import {debug} from "@rasla/logify";
import {joinPath} from "@/utils/WebPath";

export class DiskDriverForBaiduNetDisk extends AbsDiskPluginStore {
  public readonly props: DiskFormBaiduNetDisk;
  public readonly uploadThread: number;
  public vipType: number = 0 // 会员类型，0普通用户(4G/4M)、1普通会员(10G/16M)、2超级会员(20G/32M)

  constructor(source: DiskSourceView) {
    super(source.id);
    this.props = source.data as DiskFormBaiduNetDisk;
    const {UploadThread} = this.props;
    if (UploadThread > 32 || UploadThread < 1) {
      this.uploadThread = 3;
    } else {
      this.uploadThread = UploadThread;
    }
    try {
      new URL(this.props.UploadAPI)
    } catch (_e) {
      // 不是一个链接，重置
      this.props.UploadAPI = "https://d.pcs.baidu.com"
    }
  }

  async init(): Promise<void> {
    const rsp = await baiduNetDiskGet('/xpan/nas', {
      "method": "uinfo"
    }, this);
    debug(`[baidu] get uinfo: ${rsp}`)
    this.vipType = rsp.vip_type;
  }

  cp(file: SourceDiskDir, folder: SourceDiskDir): Promise<void> {
    return Promise.resolve(undefined);
  }

  getFileDownloadLink(file: SourceDiskDir): Promise<DiskFileLink> {
    if (this.props.DownloadAPI === 'crack') {
      return baiduNetDiskLinkCrack(file, this);
    } else if (this.props.DownloadAPI === 'crack_video') {
      return baiduNetDiskLinkCrackVideo(file, this);
    }
    return baiduNetDiskLinkOfficial(file, this);
  }

  list(parent: SourceDiskDir): Promise<Array<DirItem>> {
    return baiduNetDiskGetFiles(parent.path, this);
  }

  mkdir(folder: SourceDiskDir, name: string): Promise<void> {
    return baiduNetDiskCreate({
      path: joinPath(folder.path, name),
      size: 0, isdir: 1, uploadid: "", block_list: "", ctime: 0, mtime: 0
    }, this);
  }

  async mv(file: SourceDiskDir, folder: SourceDiskDir): Promise<void> {
    await baiduNetDiskManage('move', {
      path: file.path,
      dest: folder.path,
      newname: file.name
    }, this)
  }

  readFile(request: Request, file: SourceDiskDir): Promise<Response> {
    return Promise.resolve(new Response());
  }

  rename(item: SourceDiskDir, newName: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  rm(item: SourceDiskDir): Promise<void> {
    return Promise.resolve(undefined);
  }

  writeFile(request: Request, folder: SourceDiskDir, option: DiskUploadOption): Promise<void> {
    return Promise.resolve(undefined);
  }
}