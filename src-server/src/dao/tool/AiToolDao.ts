import {BaseMapper} from "@/modules/database/BaseMapper";
import {AiTool} from "@/types/AiTool";
import {Database} from "db0";

export class AiToolDao extends BaseMapper<AiTool> {
  constructor(db: Database) {
    super(db, "ai_tool");
  }
}