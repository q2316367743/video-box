import {BaseMapper} from "@/modules/database/BaseMapper";
import {TaskExecution} from "@/types/Task";
import {Database} from "db0";

export class TaskExecutionDao extends BaseMapper<TaskExecution> {
  constructor(db: Database) {
    super(db, "task_execution");
  }
}