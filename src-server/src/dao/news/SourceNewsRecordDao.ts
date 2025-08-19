import {BaseMapper} from "@/modules/database/BaseMapper";
import {Database} from "db0";
import {SourceNewsRecord} from "@/types/SourceNews";

export class SourceNewsRecordDao extends BaseMapper<SourceNewsRecord> {
  constructor(db: Database) {
    super(db, "source_news_record");
  }
}