import {BaseMapper} from "@/modules/database/BaseMapper";
import {MyVideoItem} from "@/types/MyVideoItem";
import {Database} from "db0";

export class MyVideoItemDao extends BaseMapper<MyVideoItem> {

  constructor(db: Database) {
    super(db, "my_video_item");
  }

}