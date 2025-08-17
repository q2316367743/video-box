import { DialogPlugin, Space, Input, Button, Table, TableProps } from 'tdesign-vue-next';
import { useFuse } from '@vueuse/integrations/useFuse';
import { adminSourceAiRefresh, adminSourceAModels } from '@/apis/admin/source/ai'
import type { SourceAi, SourceAiModel } from '@/types/SourceAi'
import { toDateString } from '@/utils/lang/FormatUtil'


export const showModelListDialog = (props: SourceAi) => {
  const ModelListContent = defineComponent({
    setup() {
      const modelSearchKeyword = ref('');
      const loading = ref(false);
      const models = ref<SourceAiModel[]>([]);
      // 模型表格列配置
      const modelColumns: TableProps['columns'] = [
        { colKey: 'model', title: '模型', width: 300, ellipsis: true },
        { colKey: 'owned', title: '所属', width: 200, ellipsis: true },
        { colKey: 'created_at', title: '刷新时间', width: 160, cell: (h, { row }) => toDateString(row.created_at) }
      ]

      const { results } = useFuse(modelSearchKeyword, models, {
        matchAllWhenSearchEmpty: true,
        fuseOptions: {
          keys: ['model', 'owned']
        }
      });
      const data = computed(() => results.value.map(e => e.item))

      const loadModels = async () => {
        if (loading.value) return;
        loading.value = true
        try {
          const response = await adminSourceAModels(props.id)
          models.value = response
        } catch (error) {
          console.error('获取模型列表失败:', error)
        } finally {
          loading.value = false
        }
      }

      const handleRefreshCurrentModels = async () => {
        await adminSourceAiRefresh(props.id)
        await loadModels()
      }

      loadModels()

      return () => (
        <>
          <div class="flex justify-between items-center">
            <span>{props.name} 的可用模型 ({models.value.length})</span>
            <Space>
              <Input v-model={modelSearchKeyword.value} placeholder="搜索模型..." clearable style="width: 200px">{{
                prefixIcon: () => <search-icon />
              }}</Input>
              <Button variant="outline" loading={loading.value} onClick={handleRefreshCurrentModels} v-slots={{ icon: () => <sync-icon /> }}>
                刷新
              </Button>
            </Space>
          </div>
          <Table data={data.value} loading={loading.value} columns={modelColumns} stripe hover max-height="500" rowKey='id' class={'mt-8px'}
            scroll={{ isFixedRowHeight: true, rowHeight: 46, bufferSize: 20, type: 'lazy' }} />
        </>
      )
    }
  })

  const dialog = DialogPlugin({
    header: `${props.name} - 模型列表`,
    body: () => <ModelListContent />,
    width: 800,
    destroyOnClose: true,
    placement: 'center',
    footer: false
  })

  return dialog
}