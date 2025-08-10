import {BaseMapper} from "@/modules/database/BaseMapper";
import {Database} from "db0";
import {SourceSubscribe} from "@/types/SourceSubscribe";

export class SourceSubscribeDao extends BaseMapper<SourceSubscribe> {
  constructor(db: Database) {
    super(db, "source_subscribe");
  }
}