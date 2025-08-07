import {debug, error} from '@rasla/logify';
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
import {saveTempFile} from "@/service/plugin/disk/PluginDiskUploadService";
import {join} from "node:path";
import {APP_TEMP_DIR} from "@/global/constant";
import {commonReadFile} from "@/utils/http/HttpUtil";

export class DiskDriverForQuarkOrUc extends AbsDiskPluginStore {

  public readonly props: DiskFormQuarkUc;
  public readonly config: DiskConfigQuarkUc;
  private readonly MAX_SIZE = 100 * 1024 * 1024; // 100 MB，可按需修改

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

  async readFile(request: Request, file: SourceDiskDir): Promise<Response> {
    return commonReadFile(request, file, f => this.getFileDownloadLink(f));
  }

  /**
   * 计算文件 MD5 与 SHA1（分块增量，低内存）
   * @param filePath 文件绝对或相对路径
   * @returns 形如 { md5: string, sha1: string } | null
   */
  private async hashFile(filePath: string): Promise<{ md5: string; sha1: string } | null> {
    const f = Bun.file(filePath);

    // 1. 先拿大小，超阈值直接返回 null
    const {size} = await f.exists().then((ok) => (ok ? f.stat() : Promise.reject("文件不存在")));
    if (size > this.MAX_SIZE) {
      console.error(`文件大小 ${size} 超出限制 ${this.MAX_SIZE}，跳过`);
      return null;
    }

    // 2. 打开文件流
    const stream = f.stream();
    const reader = stream.getReader();

    // 3. 同时创建两个哈希器
    const md5 = new Bun.CryptoHasher("md5");
    const sha1 = new Bun.CryptoHasher("sha1");

    // 4. 分块读取并增量更新
    // const CHUNK = 1024 * 1024; // 1 MB 一块
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      md5.update(value);
      sha1.update(value);
    }

    reader.releaseLock();
    return {
      md5: md5.digest("hex"),
      sha1: sha1.digest("hex"),
    };
  }

  async writeFile(request: Request, folder: SourceDiskDir, option: DiskUploadOption): Promise<void> {
    if (!request.body) return Promise.reject(new Error("请求体缺失"));
    // 1. 调“前一个接口”拿元数据
    debug('quark_uc: 1. 调“前一个接口”拿元数据')
    const pre = await quarkOrUcUpPre(folder, option, this);
    let requestReader: ReadableStreamDefaultReader<Uint8Array>

    // 2. 判断hash是否存在，如果不存在，缓存到临时文件，之后计算哈希值
    debug('quark_uc: 2. 判断hash是否存在，如果不存在，缓存到临时文件，之后计算哈希值')
    if (!option.md5 || !option.sha1) {
      // 保存临时文件到本地
      debug('quark_uc: 保存临时文件到本地')
      const {tempFileName, reader} = await saveTempFile(option.filename, request.body);
      requestReader = reader;
      // 读取临时文件并计算hash
      debug('quark_uc: 读取临时文件并计算hash')
      const temFilePath = join(APP_TEMP_DIR, tempFileName);
      const hash = await this.hashFile(temFilePath);
      if (hash) {
        option.md5 = hash.md5;
        option.sha1 = hash.sha1;
      }
    } else {
      requestReader = request.body.getReader();
    }

    // 3. 进行上传前hash校验，如果不存在，则上传
    debug('quark_uc: 3. 进行上传前hash校验，如果不存在，则上传')
    try {
      const finish = await quarkOrUcUpHash(pre.data.task_id, option, this);
      debug("quark_uc: hash校验结果：" + finish.data.finish)
      if (finish.data.finish) return Promise.resolve();
    } catch (e) {
      console.error(e);
      error('夸克网盘，上传前hash检测失败：' + (e instanceof Error ? e.message : `${e}`));
    }

    const total = option.contentLength;
    let left = total;
    const partSize = pre.metadata.part_size;
    let partNumber = 1;
    const md5 = new Array<string>();
    // 2. 内部缓冲
    let buffer = new Uint8Array(0);
    // 3. 创建一个 WritableStream

    // 4. 读取数据并上传
    debug('quark_uc: 4. 读取数据并上传')
    while (true) {
      if (request.signal.aborted) return Promise.reject(new Error("请求被终止"));
      const {done, value} = await requestReader.read();
      if (done) {
        // 完成
        break;
      }
      // 忽略空数据
      if (!value) continue;
      const newBuf = new Uint8Array(buffer.length + value.length);
      newBuf.set(buffer);
      newBuf.set(value, buffer.length);
      buffer = newBuf;

      // 只要 buffer 里能凑够一个 part_size 就发
      while (buffer.length >= partSize) {
        const part = buffer.slice(0, partSize);
        buffer = buffer.slice(partSize);

        const res = await quarkOrUcUpPart(pre.data, option.contentType, partNumber, part, this);
        if (res === 'finish') break;
        md5.push(res);

        partNumber += 1;
        option.onProgress?.(Number((100 * (total - left) / total).toFixed(2)));
      }
    }
    if (buffer.length) {
      const res = await quarkOrUcUpPart(pre.data, option.contentType, partNumber, buffer, this);
      md5.push(res);
    }

    // 5. 上传完成，进行提交
    debug('quark_uc: 5. 上传完成，进行提交')
    await quarkOrUcUpCommit(pre.data, md5, this);
    // 6. 上传结束，关闭上传任务
    debug('quark_uc: 6. 上传结束，关闭上传任务')
    await quarkOrUcUpFinish(pre.data, this)

  }

  init(): Promise<void> {
    return Promise.resolve();
  }

}