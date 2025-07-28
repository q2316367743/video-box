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