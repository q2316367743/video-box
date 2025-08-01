import {FolderWebDao} from "@/dao/FolderWebDao";
import {db} from "@/global/db";
import {SourceWebDao} from "@/dao/SourceWebDao";
import {SourceTvChannelDao} from "@/dao/SourceTvChannelDao";
import {SourceTvDao} from "@/dao/SourceTvDao";
import {SettingDao} from "@/dao/SettingDao";
import {SourceDiskDao} from "@/dao/SourceDiskDao";
import {SourceDiskDirDao} from "@/dao/SourceDiskDirDao";

export const settingDao = new SettingDao(db);
export const folderWebDao = new FolderWebDao(db);
export const sourceWebDao = new SourceWebDao(db);
export const sourceTvChannelDao = new SourceTvChannelDao(db);
export const sourceTvDao = new SourceTvDao(db);
export const sourceDiskDao = new SourceDiskDao(db);
export const sourceDiskDirDao = new SourceDiskDirDao(db);