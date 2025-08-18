import {BaseMapper} from "@/modules/database/BaseMapper";
import {Resource} from "@/types/Resource";
import {Database} from "db0";

export class ResourceDao extends BaseMapper<Resource> {
  constructor(db: Database) {
    super(db, "resource");
  }
}