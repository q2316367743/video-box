import {AbsDiskPluginStore} from "@/modules/disk/abs/AbsDiskPluginStore";
import {DiskConfigQuarkUc, DiskFormQuarkUc} from "@/modules/disk/impl/quark-or-uc/types";
import {DiskSourceView} from "@/types/SourceDisk";
import {DirItem, DiskFileLink, DiskUploadOption} from "@/modules/disk/DiskPlugin";
import {
  quarkOrUcDownloadLink,
  quarkOrUcGetFiles,
  quarkOrUcRequest,
  quarkOrUcUpCommit,
  quarkOrUcUpFinish,
  quarkOrUcUpHash,
  quarkOrUcUpPart,
  quarkOrUcUpPre
} from "@/modules/disk/impl/quark-or-uc/utils";
import {SourceDiskDir} from "@/types/SourceDiskDIr";

export class DiskDriverForQuarkOrUc extends AbsDiskPluginStore {
  public readonly props: DiskFormQuarkUc;
  public readonly config: DiskConfigQuarkUc;

  constructor(source: DiskSourceView, config: DiskConfigQuarkUc) {
    super(source.id);
    this.props = source.data as DiskFormQuarkUc;
    this.config = config;
  }

  public async updateCookie(cookie: string) {
    await this.updateData({
      ...this.props,
      Cookie: cookie
    });
    this.props['Cookie'] = cookie;
  }

  cp(_file: SourceDiskDir, _folder: SourceDiskDir): Promise<void> {
    return Promise.reject(new Error("夸克网盘不支持复制操作"))
  }

  async mkdir(folder: SourceDiskDir, name: string): Promise<void> {
    await quarkOrUcRequest('/file', 'POST', {
      data: {
        dir_init_lock: false,
        dir_path: '',
        file_name: name,
        pdir_fid: folder.sign
      }
    }, this);
    await Bun.sleep(1000);
  }

  async mv(file: SourceDiskDir, folder: SourceDiskDir): Promise<void> {
    await quarkOrUcRequest('/file/move', 'POST', {
      data: {
        "action_type": 1,
        "exclude_fids": [],
        "filelist": [file.sign],
        "to_pdir_fid": folder.sign,
      }
    }, this);
  }

  async rename(item: SourceDiskDir, newName: string): Promise<void> {
    await quarkOrUcRequest('/file/rename', 'POST', {
      data: {
        fid: item.sign,
        file_name: newName
      }
    }, this);
  }

  async rm(item: SourceDiskDir): Promise<void> {
    await quarkOrUcRequest("/file/delete", 'POST', {
      data: {
        "action_type": 1,
        "exclude_fids": [],
        "filelist": [item.sign],
      }
    }, this);
  }

  async getFileDownloadLink(file: SourceDiskDir): Promise<DiskFileLink> {
    const url = await quarkOrUcDownloadLink(file, this);
    return {
      url,
      headers: {
        Cookie: this.props.Cookie,
        Referer: this.config.referer,
        'User-Agent': this.config.ua,
      },
      concurrency: 3,
      part_size: 1024 * 1024 * 10
    }
  }

  list(parent: SourceDiskDir): Promise<Array<DirItem>> {
    return quarkOrUcGetFiles(parent, this);
  }

  async readFile(file: SourceDiskDir, headers: Record<string, string>, signal: AbortSignal): Promise<Response> {
    const link = await this.getFileDownloadLink(file);
    const rsp = await fetch(link.url, {
      headers: {
        ...headers,
        ...link.headers
      },
      signal
    });
    return new Response(rsp.body, {
      headers: rsp.headers,
      status: rsp.status,
      statusText: rsp.statusText
    });
  }

  async writeFile(folder: SourceDiskDir, option: DiskUploadOption): Promise<WritableStream> {
    // 1. 调“前一个接口”拿元数据
    const pre = await quarkOrUcUpPre(folder, option, this);
    const finish = await quarkOrUcUpHash(pre.data.task_id, option, this);
    if (finish) return Promise.resolve(new WritableStream());

    const total = option.contentLength;
    let left = total;
    const partSize = pre.metadata.part_size;
    let partNumber = 1;
    const md5 = new Array<string>();
    // 2. 内部缓冲
    let buffer = new Uint8Array(0);
    // 3. 创建一个 WritableStream
    return new WritableStream({
      write: async (chunk) => {
        const newBuf = new Uint8Array(buffer.length + chunk.length);
        newBuf.set(buffer);
        newBuf.set(chunk, buffer.length);
        buffer = newBuf;

        // 只要 buffer 里能凑够一个 part_size 就发
        while (buffer.length >= partSize) {
          const part = buffer.slice(0, partSize);
          buffer = buffer.slice(partSize);

          const res = await quarkOrUcUpPart(pre.data, option.contentType, partNumber, part, this);
          if (res === 'finish') return;
          md5.push(res);

          partNumber += 1;
          option.onProgress?.(Number((100 * (total - left) / total).toFixed(2)));
        }
      },
      abort: (reason) => {
        console.error(reason);
      },
      close: async () => {
        if (buffer.length) {
          const res = await quarkOrUcUpPart(pre.data, option.contentType, partNumber, buffer, this);
          md5.push(res);
        }
        await quarkOrUcUpCommit(pre.data, md5, this);
        await quarkOrUcUpFinish(pre.data, this)
      }
    });
  }

}