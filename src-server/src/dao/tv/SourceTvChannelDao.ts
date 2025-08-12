import {Database} from "db0";
import {BaseMapper} from "@/modules/database/BaseMapper";
import {SourceTvChannel} from "@/types/SourceTv";

export class SourceTvChannelDao extends BaseMapper<SourceTvChannel> {
  constructor(db: Database) {
    super(db, "source_tv_channel");
  }

  async deleteFromTvId(sourceTvId: string) {
    await this.db.sql`delete from source_tv_channel where source_tv_id = ${sourceTvId}`;
  }

}