import {BaseMapper} from "@/modules/database/BaseMapper";
import {Database} from "db0";
import {SourceNewsContent} from "@/types/SourceNews";

export class SourceNewsContentDao extends BaseMapper<SourceNewsContent> {
  constructor(db: Database) {
    super(db, "source_news_content");
  }
}