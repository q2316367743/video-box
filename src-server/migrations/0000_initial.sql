-- 文件件/网络资源
CREATE TABLE folder_web (
  id CHAR(18) PRIMARY KEY,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(255) NOT NULL DEFAULT '',
  `order` INTEGER NOT NULL DEFAULT 0
);
-- 网络资源
create table source_web (
  id CHAR(18) primary key,
  create_time TIMESTAMP default CURRENT_TIMESTAMP not null,
  update_time TIMESTAMP default CURRENT_TIMESTAMP not null,
  title VARCHAR(255) default '' not null,
  type SMALLINT default 0 not null,
  favicon VARCHAR(255) default '' not null,
  folder TEXT default '' not null,
  "order" INTEGER default 0 not null,
  props VARCHAR(1024) not null,
  refresh_time integer default CURRENT_TIMESTAMP not null,
  retry_count integer default 0 not null,
  delay_time integer default 0 not null
);
-- 我的视频数据
CREATE TABLE my_video_item (
  id CHAR(18) PRIMARY KEY,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `type` SMALLINT NOT NULL DEFAULT 0,
  `from` SMALLINT NOT NULL DEFAULT 0,
  payload VARCHAR(255) NOT NULL DEFAULT '',
  cover VARCHAR(255) NOT NULL DEFAULT '',
  title VARCHAR(255) NOT NULL DEFAULT '',
  `description` VARCHAR(255) NOT NULL DEFAULT ''
);
-- 直播源
CREATE TABLE source_tv (
  id CHAR(18) PRIMARY KEY,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `name` VARCHAR(255) NOT NULL DEFAULT '',
  `url` VARCHAR(255) NOT NULL DEFAULT '',
  `timeout` INTEGER NOT NULL DEFAULT 0,
  `length` INTEGER NOT NULL DEFAULT 0,
  refresh_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  refresh_status SMALLINT NOT NULL DEFAULT 0
);
-- 直播渠道
CREATE TABLE source_tv_channel (
  id CHAR(18) PRIMARY KEY,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  source_tv_id CHAR(18) NOT NULL DEFAULT '',
  `logo` VARCHAR(255) NOT NULL DEFAULT '',
  `name` VARCHAR(255) NOT NULL DEFAULT '',
  `url` VARCHAR(255) NOT NULL DEFAULT '',
  `group` INTEGER NOT NULL DEFAULT 0
);