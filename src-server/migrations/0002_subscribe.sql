-- 订阅源
create table source_subscribe
(
    id           text primary key,
    created_at   integer not null default CURRENT_TIMESTAMP,
    updated_at   integer not null default CURRENT_TIMESTAMP,
    `group`      text    not null default '',
    type         integer not null,
    driver       text    not null default '',
    display      integer not null,
    icon         text    not null default '',
    name         text    not null default '',
    description  text    not null default '',
    url          text    not null default '',
    link         text    not null default '',
    ai           integer not null default 0,
    `order`      integer not null default 0,
    record_count integer not null default -1
);
-- 订阅源规则
create table source_subscribe_rule
(
    id               text primary key,
    subscribe_id     text not null default '',
    data             text not null default '',
    list             text not null default '',
    item_title       text not null default '',
    item_description text not null default '',
    item_pub_date    text not null default '',
    item_link        text not null default '',
    item_content     text not null default '',
    item_charset     text not null default ''
);
-- 订阅内容记录
create unique index ssr_subscribe_id_uq_index
    on source_subscribe_rule (subscribe_id);
-- 订阅源 RSS Hub 实例
create table source_subscribe_rss_hub
(
    id           text primary key,
    created_at   integer not null default CURRENT_TIMESTAMP,
    updated_at   integer not null default CURRENT_TIMESTAMP,
    name         text    not null default '',
    description  text    not null default '',
    url          text    not null default '',
    `password`   text    not null default '',
    refresh_time integer not null default 0,
    retry_count  integer not null default 0,
    delay_time   integer not null default 0,
    is_enabled   integer not null default 0
);
-- 订阅浏览记录
create table source_subscribe_record
(
    id           text primary key,
    created_at   integer not null default CURRENT_TIMESTAMP,
    updated_at   integer not null default CURRENT_TIMESTAMP,
    subscribe_id text    not null default '',
    title        text    not null default '',
    description  text    not null default '',
    pub_date     integer not null default 0,
    link         text    not null default '',
    read_status  integer not null default 0
);

create unique index uq_ssr_subscribe_id_link
    on source_subscribe_record (subscribe_id, link);

-- 订阅浏览媒体
create table source_subscribe_media
(
    id           text primary key,
    created_at   integer not null default CURRENT_TIMESTAMP,
    subscribe_id text    not null default '',
    record_id    text    not null default '',
    alt          text    not null default '',
    url          text    not null default '',
    type         integer not null default 0,
    `order`      integer not null default 0
);
-- 订阅内容
create table source_subscribe_content
(

    id           text primary key,
    created_at   integer not null default CURRENT_TIMESTAMP,
    subscribe_id text    not null default '',
    record_id    text    not null default '',
    link         text    not null default '',
    content      text    not null default '',
    ai           text    not null default ''
);
-- 订阅内容记录
create unique index ssc_record_id_uq_index
    on source_subscribe_content (record_id);

-- 文件上传
insert into task_definition (id, name, type, schedule, script)
values ('subscribe:cache', '订阅:刷新缓存', 'preset', '0 0 0/2 * * ?', 'SubscribeCache.ts');
-- 刷新rss hub可用性
insert into task_definition (id, name, type, schedule, script)
values ('subscribe:refresh-rss_hub', '订阅:刷新rss hub可用性', 'preset', '*/30 * * * *', 'refreshSourceRssHub.ts');

-- AI
create table source_ai
(
    id          text primary key,
    created_at  integer not null default CURRENT_TIMESTAMP,
    updated_at  integer not null default CURRENT_TIMESTAMP,
    name        text    not null default '',
    description text    not null default '',
    url         text    not null default '',
    token       text    not null default '',
    is_enabled  integer not null default 1
);

-- AI模型
create table source_ai_model
(
    id         text primary key,
    created_at integer not null default CURRENT_TIMESTAMP,
    updated_at integer not null default CURRENT_TIMESTAMP,
    ai_id      text    not null default '',

    model      text    not null default '',
    owned      text    not null default ''
);