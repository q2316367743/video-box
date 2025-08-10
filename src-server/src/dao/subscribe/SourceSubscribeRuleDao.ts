import {BaseMapper} from "@/modules/database/BaseMapper";
import {Database} from "db0";
import {SourceSubscribeRule} from "@/types/SourceSubscribe";

export class SourceSubscribeRuleDao extends BaseMapper<SourceSubscribeRule> {
  constructor(db: Database) {
    super(db, "source_subscribe_rule");
  }
}