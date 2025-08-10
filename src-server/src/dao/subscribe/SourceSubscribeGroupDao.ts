import {BaseMapper} from "@/modules/database/BaseMapper";
import {SourceSubscribeGroup} from "@/types/SourceSubscribe";
import {Database} from "db0";

export class SourceSubscribeGroupDao extends BaseMapper<SourceSubscribeGroup> {

  constructor(db: Database) {
    super(db, "source_subscribe_group");
  }

}