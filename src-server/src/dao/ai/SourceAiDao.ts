import {BaseMapper} from "@/modules/database/BaseMapper";
import {SourceAi} from "@/types/SourceAi";
import {Database} from "db0";

export class SourceAiDao extends BaseMapper<SourceAi> {

  constructor(db: Database) {
    super(db, 'source_ai');
  }

}