import {BaseMapper} from "@/modules/database/BaseMapper";
import {Database} from "db0";
import {SourceSubscribeMedia} from "@/types/SourceSubscribe";

export class SourceSubscribeMediaDao extends BaseMapper<SourceSubscribeMedia> {
  constructor(db: Database) {
    super(db, "source_subscribe_media");
  }
}