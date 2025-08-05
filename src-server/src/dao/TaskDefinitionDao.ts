import {BaseMapper} from "@/modules/database/BaseMapper";
import {TaskDefinition} from "@/types/Task";
import {Database} from "db0";

export class TaskDefinitionDao extends BaseMapper<TaskDefinition> {
  constructor(db: Database) {
    super(db, "task_definition");
  }
}