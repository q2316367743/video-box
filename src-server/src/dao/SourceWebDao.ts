import {BaseMapper} from "@/modules/database/BaseMapper";
import {SourceWeb} from "@/types/SourceWeb";
import {Database} from "db0";
import {db} from "@/global/db";

export class SourceWebDao extends BaseMapper<SourceWeb> {
  constructor(db: Database) {
    super(db, "source_web");
  }

  async selectRoot(): Promise<Array<SourceWeb>> {
    const {rows} = await db.sql`
        select *
        from source_web
        where (folder = '0' or folder not in (select id from folder_web))
          and is_enabled = 1;
    `;
    return (rows as any as Array<SourceWeb>) || []
  }


}