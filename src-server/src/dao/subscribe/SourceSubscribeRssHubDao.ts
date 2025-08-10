import {BaseMapper} from "@/modules/database/BaseMapper";
import {Database} from "db0";
import {SourceSubscribeRssHub} from "@/types/SourceSubscribe";

export class SourceSubscribeRssHubDao extends BaseMapper<SourceSubscribeRssHub> {
  constructor(db: Database) {
    super(db, "source_subscribe_rss_hub");
  }
}