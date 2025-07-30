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
    id TEXT primary key,
    create_time TIMESTAMP default CURRENT_TIMESTAMP not null,
    update_time TIMESTAMP default CURRENT_TIMESTAMP not null,
    title TEXT NOT NULL DEFAULT '',
    driver TEXT NOT NULL DEFAULT '',
    data TEXT NOT NULL DEFAULT ''
)