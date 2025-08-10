import {BaseMapper} from "@/modules/database/BaseMapper";
import {Database} from "db0";
import {SourceSubscribeRecord} from "@/types/SourceSubscribe";

export class SourceSubscribeRecordDao extends BaseMapper<SourceSubscribeRecord> {
  constructor(db: Database) {
    super(db, "source_subscribe_record");
  }
}