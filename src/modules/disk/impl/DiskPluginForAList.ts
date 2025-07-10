import {DiskSource} from "@/entities/disk/DiskSource";
import {DiskPlugin} from "@/modules/disk/DiskPlugin";

export class DiskPluginForAList implements DiskPlugin {

  private readonly source: DiskSource<"A_LIST">;

  constructor(source: DiskSource<"A_LIST">) {
    this.source = source;
  }
}