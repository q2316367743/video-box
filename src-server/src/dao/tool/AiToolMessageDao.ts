import {BaseMapper} from "@/modules/database/BaseMapper";
import {AiTool, AiToolMessage} from "@/types/AiTool";
import {Database} from "db0";

export class AiToolMessageDao extends BaseMapper<AiToolMessage> {
  constructor(db: Database) {
    super(db, "ai_tool_message");
  }
}