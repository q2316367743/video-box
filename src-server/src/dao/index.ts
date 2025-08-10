import {FolderWebDao} from "@/dao/FolderWebDao";
import {db} from "@/global/db";
import {SourceWebDao} from "@/dao/SourceWebDao";
import {SourceTvChannelDao} from "@/dao/SourceTvChannelDao";
import {SourceTvDao} from "@/dao/SourceTvDao";
import {SettingDao} from "@/dao/SettingDao";
import {SourceDiskDao} from "@/dao/SourceDiskDao";
import {SourceDiskDirDao} from "@/dao/SourceDiskDirDao";
import {TaskDefinitionDao} from "@/dao/TaskDefinitionDao";
import {TaskExecutionDao} from "@/dao/TaskExecutionDao";
import {MyVideoItemDao} from "@/dao/MyVideoItemDao";
import {SourceSubscribeDao} from "@/dao/subscribe/SourceSubscribeDao";
import {SourceSubscribeRuleDao} from "@/dao/subscribe/SourceSubscribeRuleDao";
import {SourceSubscribeRssHubDao} from "@/dao/subscribe/SourceSubscribeRssHubDao";
import {SourceSubscribeContentDao} from "@/dao/subscribe/SourceSubscribeContentDao";
import {SourceSubscribeRecordDao} from "@/dao/subscribe/SourceSubscribeRecordDao";
import {SourceSubscribeGroupDao} from "@/dao/subscribe/SourceSubscribeGroupDao";

export const settingDao = new SettingDao(db);
export const folderWebDao = new FolderWebDao(db);
export const sourceWebDao = new SourceWebDao(db);
export const sourceTvChannelDao = new SourceTvChannelDao(db);
export const sourceTvDao = new SourceTvDao(db);
export const sourceDiskDao = new SourceDiskDao(db);
export const sourceDiskDirDao = new SourceDiskDirDao(db);
export const taskDefinitionDao = new TaskDefinitionDao(db);
export const taskExecutionDao = new TaskExecutionDao(db);
export const myVideoItemDao = new MyVideoItemDao(db);

export const sourceSubscribeDao = new SourceSubscribeDao(db);
export const sourceSubscribeGroupDao = new SourceSubscribeGroupDao(db);
export const sourceSubscribeRuleDao = new SourceSubscribeRuleDao(db);
export const sourceSubscribeRssHubDao = new SourceSubscribeRssHubDao(db)
export const sourceSubscribeRecordDao = new SourceSubscribeRecordDao(db)
export const sourceSubscribeContentDao = new SourceSubscribeContentDao(db)