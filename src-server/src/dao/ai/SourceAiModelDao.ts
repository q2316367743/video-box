import {BaseMapper} from "@/modules/database/BaseMapper";
import {SourceAi, SourceAiModel} from "@/types/SourceAi";
import {Database} from "db0";

export class SourceAiModelDao extends BaseMapper<SourceAiModel> {

  constructor(db: Database) {
    super(db, 'source_ai_model');
  }

}