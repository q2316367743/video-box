import {FolderWebDao} from "@/dao/FolderWebDao";
import {db} from "@/global/db";
import {SourceWebDao} from "@/dao/SourceWebDao";

export const folderWebDao = new FolderWebDao(db);
export const sourceWebDao = new SourceWebDao(db);