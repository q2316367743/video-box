import {BaseMapper} from "@/modules/database/BaseMapper";
import {SourceRandom} from "@/types/SourceRandom";
import {Database} from "db0";

export class SourceRandomDao extends BaseMapper<SourceRandom> {
  constructor(db: Database) {
    super(db, "source_random");
  }
}