import {BaseMapper} from "@/modules/database/BaseMapper";
import {AiTool, AiToolSession} from "@/types/AiTool";
import {Database} from "db0";

export class AiToolSessionDao extends BaseMapper<AiToolSession> {
  constructor(db: Database) {
    super(db, "ai_tool_session");
  }
}