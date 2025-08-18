import { pluginSubscribeAdd, pluginSubscribeParse } from "@/apis/plugin/subscribe";
import EmptyResult from "@/components/Result/EmptyResult.vue";
import { SourceSubscribePostParam, SubscribeRssParseResult } from "@/types/SourceSubscribe";
import MessageUtil from "@/utils/modal/MessageUtil";
import { DialogPlugin, Loading, Input, Button } from "tdesign-vue-next";
import styles from "./SubscribeDiscoverDialog.module.css";
import { useRssRefreshRoot } from "@/global/EventBus";

export async function openSubscribeDiscoverRssDialog(url: string) {
  openSubscribeDiscoverDialog({
    name: '',
    description: '',
    icon: '',
    url,
    link: '',
    group: '',
    type: 1,
    driver: '',
    display: 1,
    ai: 0,
    rule: {
      data: {},
      list: '',
      item_charset: '',
      item_content: '',
      item_description: '',
      item_link: '',
      item_pub_date: '',
      item_title: ''
    }
  });
}

export async function openSubscribeDiscoverDialog(param: SourceSubscribePostParam) {

  const form = ref<SourceSubscribePostParam>(param);
  const result = ref<SubscribeRssParseResult>();
  const loading = ref(true);
  const error = ref(false);
  const customIcon = ref<string>('');

  pluginSubscribeParse(param).then(response => {
    result.value = response;
  }).catch(e => {
    MessageUtil.error("解析错误", e);
    error.value = true;
  }).finally(() => {
    loading.value = false;
  })

  const dp = DialogPlugin({
    header: '添加订阅源',
    confirmBtn: '订阅',
    cancelBtn: '取消',
    closeBtn: false,
    width: '694px',
    placement: 'center',
    closeOnOverlayClick: false,
    default: () => <Loading loading={loading.value}>
      {error.value && <EmptyResult title="请求失败" />}
      {(!error.value && result.value) && <div class={styles['subscribe-dialog']}>
        {/* RSS 源信息展示 */}
        <div class={styles['rss-info']}>
          <div class={styles['rss-header']}>
            <img src={result.value?.icon || '/logo.png'} alt="icon" class={styles['rss-icon']} />
            <div class={styles['rss-details']}>
              <h3 class={styles['rss-title']}>{result.value?.name}</h3>
              <div class={styles['rss-url']}>{result.value?.url}</div>
              <div class={styles['rss-description']}>{result.value?.description}</div>
              <div class={styles['rss-stats']}>
                <span>👥 4.1K 订阅者</span>
                <span>📅 2 条/周</span>
              </div>
            </div>
          </div>
        </div>

        {/* 表单区域 */}
        <div class={styles['form-section']}>
          {/* 标题 */}
          <div class={styles['form-item']}>
            <label class={styles['form-label']}>标题</label>
            <div class={styles['form-description']}>给订阅源的自定义标题，留空则使用默认标题。</div>
            <div class={'w-full flex gap-8px'}>
              <Input
                v-model={form.value.name}
                placeholder="请输入标题"
                class={[styles['form-input'], 'flex-auto']}
              />
              <div class={'flex-60px'}>
                <Button variant="outline" theme="primary">填充</Button>
              </div>
            </div>
          </div>

          {/* 图标 */}
          <div class={styles['form-item']}>
            <label class={styles['form-label']}>图标</label>
            <div class={styles['form-description']}>自定义订阅源图标，留空则使用默认图标。</div>
            <div class={styles['icon-input-container']}>
              <div class={styles['icon-preview']}>
                {(customIcon.value || result.value?.icon) ? (
                  <img
                    src={customIcon.value || result.value?.icon}
                    alt="icon"
                    onError={() => customIcon.value = ''}
                  />
                ) : (
                  <div class={styles['icon-preview-placeholder']}>
                    无图标
                  </div>
                )}
              </div>
              <div class={styles['icon-input-wrapper']}>
                <Input
                  v-model={customIcon.value}
                  placeholder="请输入图标URL"
                  class={styles['form-input']}
                />
              </div>
            </div>
          </div>

          {/* 分类 */}
          <div class={styles['form-item']}>
            <label class={styles['form-label']}>分类</label>
            <div class={styles['form-description']}>默认情况下，您的订阅将按网站合并。</div>
            <Input
              v-model={form.value.group}
              placeholder="请输入分类"
              class={styles['form-input']}
            />
          </div>

          {/* 主页 */}
          <div class={styles['form-item']}>
            <label class={styles['form-label']}>主页</label>
            <div class={styles['form-description']}>这是网站的主页。</div>
            <Input
              v-model={form.value.link}
              placeholder="请输入网站主页"
              class={styles['form-input']}
            />
          </div>

          {/* 视图 */}
          <div class={styles['form-item']}>
            <label class={styles['form-label']}>视图</label>
            <div class={styles['view-options']}>
              <div
                class={[styles['view-option'], form.value.display === 1 && styles.active]}
                onClick={() => form.value.display = 1}
              >
                <div class={styles['view-icon']}>📄</div>
              </div>
              <div
                class={[styles['view-option'], form.value.display === 2 && styles.active]}
                onClick={() => form.value.display = 2}
              >
                <div class={styles['view-icon']}>🐦</div>
              </div>
              <div
                class={[styles['view-option'], form.value.display === 3 && styles.active]}
                onClick={() => form.value.display = 3}
              >
                <div class={styles['view-icon']}>🖼️</div>
              </div>
              <div
                class={[styles['view-option'], form.value.display === 4 && styles.active]}
                onClick={() => form.value.display = 4}
              >
                <div class={styles['view-icon']}>📺</div>
              </div>
              <div
                class={[styles['view-option'], form.value.display === 5 && styles.active]}
                onClick={() => form.value.display = 5}
              >
                <div class={styles['view-icon']}>🎵</div>
              </div>
              <div
                class={[styles['view-option'], form.value.display === 6 && styles.active]}
                onClick={() => form.value.display = 6}
              >
                <div class={styles['view-icon']}>🔔</div>
              </div>
            </div>
          </div>
        </div>

      </div>}

    </Loading>,
    onConfirm() {
      dp.setConfirmLoading(true);
      pluginSubscribeAdd({
        ...form.value,
        name: form.value.name || result.value?.name || '',
        link: form.value.link || result.value?.link || '',
        icon: customIcon.value || result.value?.icon || ''
      }).then(() => {
        dp.destroy();
        MessageUtil.success("添加成功");
        // 触发刷新根目录
        useRssRefreshRoot.trigger();
      }).finally(() => {
        dp.setConfirmLoading(false);
      })
    },
  });
}