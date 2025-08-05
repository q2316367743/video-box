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

-- 任务定义表
CREATE TABLE task_definition
(
    id         TEXT PRIMARY KEY,
    name       TEXT,
    `type`     TEXT CHECK (type IN ('preset', 'adhoc')),
    schedule   TEXT, -- 仅预设任务有效
    script     TEXT, -- 仅预设任务有效：impl 下的文件名
    created_at INTEGER DEFAULT CURRENT_TIMESTAMP
);

-- 文件上传
insert into task_definition (id, name, type, schedule, script)
values ('disk:file-upload', '网盘:文件上传', 'adhoc', '', '');
insert into task_definition (id, name, type, schedule, script)
values ('web:refresh-website', '网络资源:刷新网站延迟', 'preset', '*/30 * * * *', 'refreshSourceWeb.ts');

-- 任务执行记录表
CREATE TABLE task_execution
(
    id            TEXT PRIMARY KEY,
    definition_id TEXT    NOT NULL,
    identifier    TEXT    NOT NULL,
    `trigger`     TEXT CHECK (`trigger` IN ('cron', 'manual', 'internal')),
    status        TEXT CHECK (status IN ('running', 'done', 'failed', 'cancelled')),
    created_at    INTEGER          DEFAULT CURRENT_TIMESTAMP,
    finished_at   INTEGER NOT NULL DEFAULT 0,
    progress      INTEGER          DEFAULT 0,
    result        TEXT    NOT NULL DEFAULT '',
    error         TEXT    NOT NULL DEFAULT ''
);
CREATE UNIQUE INDEX ux_running
    ON task_execution (identifier) WHERE status = 'running';