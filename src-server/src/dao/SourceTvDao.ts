import {BaseMapper} from "@/modules/database/BaseMapper";
import {SourceTv} from "@/types/SourceTv";
import {Database} from "db0";

export class SourceTvDao extends BaseMapper<SourceTv> {
  constructor(db: Database) {
    super(db, "source_tv");
  }
}