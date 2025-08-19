import {BaseMapper} from "@/modules/database/BaseMapper";
import {Database} from "db0";
import {SourceNews} from "@/types/SourceNews";

export class SourceNewsDao extends BaseMapper<SourceNews> {
  constructor(db: Database) {
    super(db, "source_news");
  }
}