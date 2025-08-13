import {BaseMapper} from "@/modules/database/BaseMapper";
import {Database} from "db0";
import {SourceSubscribe} from "@/types/SourceSubscribe";

interface DisplayStatistics {
  display: number;
  record_count: number;
}

export class SourceSubscribeDao extends BaseMapper<SourceSubscribe> {
  constructor(db: Database) {
    super(db, "source_subscribe");
  }

  async displayStatistics(): Promise<Array<DisplayStatistics>> {
    const {rows} = await this.db.sql`select display, sum(record_count) as \`record_count\`
                                     from source_subscribe
                                     group by display`;
    return rows as any as Array<DisplayStatistics>;
  }

}