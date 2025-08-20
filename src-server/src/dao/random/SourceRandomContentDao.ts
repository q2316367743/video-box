import {BaseMapper} from "@/modules/database/BaseMapper";
import {SourceRandomContent} from "@/types/SourceRandom";
import {Database} from "db0";

export class SourceRandomContentDao extends BaseMapper<SourceRandomContent> {
  constructor(db: Database) {
    super(db, "source_random_content");
  }
}