import {BaseMapper} from "@/modules/database/BaseMapper";
import {Folder} from "@/types/Folder";
import {Database} from "db0";

export class FolderWebDao extends BaseMapper<Folder> {
  constructor(db: Database) {
    super(db, "folder_web");
  }
}