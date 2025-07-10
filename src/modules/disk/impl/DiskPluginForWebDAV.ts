import {DiskSource} from "@/entities/disk/DiskSource";
import {DiskPlugin} from "@/modules/disk/DiskPlugin";

export class DiskPluginForWebDAV implements DiskPlugin{
  private readonly source: DiskSource<"WEB_DAV">;

  constructor(source: DiskSource<"WEB_DAV">) {
    this.source = source;
  }
}