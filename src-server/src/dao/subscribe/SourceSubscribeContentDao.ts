import {BaseMapper} from "@/modules/database/BaseMapper";
import {Database} from "db0";
import {SourceSubscribeContent} from "@/types/SourceSubscribe";

export class SourceSubscribeContentDao extends BaseMapper<SourceSubscribeContent> {
  constructor(db: Database) {
    super(db, "source_subscribe_content");
  }
}