import {FolderWebDao} from "@/dao/FolderWebDao";
import {db} from "@/global/db";
import {SourceWebDao} from "@/dao/SourceWebDao";
import {SourceTvChannelDao} from "@/dao/SourceTvChannelDao";
import {SourceTvDao} from "@/dao/SourceTvDao";

export const folderWebDao = new FolderWebDao(db);
export const sourceWebDao = new SourceWebDao(db);
export const sourceTvChannelDao = new SourceTvChannelDao(db);
export const sourceTvDao = new SourceTvDao(db);