-- 设置表
CREATE TABLE setting
(
    id          TEXT primary key,
    `key`       TEXT                                not null,
    value       TEXT                                not null default '',
    create_time TIMESTAMP default CURRENT_TIMESTAMP not null,
    update_time TIMESTAMP default CURRENT_TIMESTAMP not null
);
CREATE UNIQUE INDEX setting_key_uq_index ON setting (`key`);

-- 网盘源
CREATE TABLE source_disk
(
    id          TEXT primary key,
    create_time TIMESTAMP     default CURRENT_TIMESTAMP not null,
    update_time TIMESTAMP     default CURRENT_TIMESTAMP not null,
    title       TEXT NOT NULL DEFAULT '',
    driver      TEXT NOT NULL DEFAULT '',
    data        TEXT NOT NULL DEFAULT ''
);

-- 网盘映射目录
CREATE TABLE source_disk_dir
(
    id             TEXT primary key,
    create_time    TIMESTAMP        default CURRENT_TIMESTAMP not null,
    update_time    TIMESTAMP        default CURRENT_TIMESTAMP not null,
    source_disk_id TEXT    NOT NULL DEFAULT '',
    sign           TEXT    NOT NULL DEFAULT '',
    path           TEXT    NOT NULL DEFAULT '',
    folder         TEXT    NOT NULL DEFAULT '',
    type           TEXT    NOT NULL DEFAULT '',
    name           TEXT    NOT NULL DEFAULT '',
    extname        TEXT    NOT NULL DEFAULT '',
    size           INTEGER NOT NULL DEFAULT 0,
    cache          BOOLEAN NOT NULL DEFAULT FALSE,
    last_modified  TEXT    NOT NULL DEFAULT '',
    cover          TEXT    NOT NULL DEFAULT '',
    expands        TEXT    NOT NULL DEFAULT ''

);

-- 网盘映射目录唯一索引
create unique index source_disk_id_sign_uq_index
    on source_disk_dir (source_disk_id, sign);
-- 映射目录唯一索引
create unique index source_disk_id_path_uq_index
    on source_disk_dir (source_disk_id, path);
-- 映射目录唯一索引
create unique index uq_index_sfn
    on source_disk_dir (source_disk_id, folder, name);

