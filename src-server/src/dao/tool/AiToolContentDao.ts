import {BaseMapper} from "@/modules/database/BaseMapper";
import {AiTool, AiToolContent} from "@/types/AiTool";
import {Database} from "db0";

export class AiToolContentDao extends BaseMapper<AiToolContent> {
  constructor(db: Database) {
    super(db, "ai_tool_content");
  }
}