import {DrawerPlugin, Form, FormItem, Input, Select} from "tdesign-vue-next";
import {adminSourceDiskAdd, adminSourceDiskProps, adminSourceDiskUpdate} from "@/apis/admin/source/disk.ts";
import {DiskSourceEntry, DiskSourceFormData} from "@/types/SourceDisk.ts";
import DiskSourceForm from '../components/DiskSourceForm.vue';
import {isEmptyString} from "@/utils/lang/FieldUtil.ts";
import MessageUtil from "@/utils/modal/MessageUtil.ts";
import {CustomForm} from "@/views/CustomForm.ts";
import {clone} from "radash";

export async function addDiskSourceDialog(onSuccess: () => void, old?: DiskSourceEntry) {
  const {options, props} = await adminSourceDiskProps();
  const op = !!old ? '更新' : '新增';
  const data = ref<DiskSourceFormData>(clone(old) || {
    title: '',
    driver: 'WEB_DAV',
    data: {},
  });
  const params = computed<Array<CustomForm>>(() => props[data.value.driver] || []);
  watch(() => data.value.driver, value => {
    // 清空参数
    data.value.data = {};
    // 默认赋值默认值
    (props[value] || []).forEach(e => {
      if (typeof e.defaultValue === 'undefined') return;
      if (typeof data.value.data[e.field] === 'undefined') return;
      data.value.data[e.field] = e.defaultValue;
    });
  });
  const dp = DrawerPlugin({
    header: op + '网盘',
    confirmBtn: op,
    size: '600px',
    default: () => <Form data={data.value}>
      <FormItem label="名称" name={'title'} required-mark rules={[{required: true, trigger: 'blur'}]}>
        <Input v-model={data.value.title}/>
      </FormItem>
      <FormItem label="类型" name={'driver'} required-mark rules={[{required: true, trigger: 'blur'}]}>
        <Select v-model={data.value.driver} options={options}/>
      </FormItem>
      <DiskSourceForm v-model={data.value.data} params={params.value} style={{marginTop: 'var(--td-comp-margin-xxl)'}}/>
    </Form>,
    onConfirm: () => {
      if (isEmptyString(data.value.title)) return MessageUtil.error("网盘名称不能为空");
      for (const param of params.value) {
        if (param.required) {
          const target = data.value.data[param.field];
          if (typeof target === 'undefined' || isEmptyString(target)) {
            return MessageUtil.error(`${param.label}不能为空`);
          }
        }
      }
      (old ? adminSourceDiskUpdate(old.id, data.value) : adminSourceDiskAdd(data.value)).then(() => {
        MessageUtil.success(op + "成功");
        dp.destroy?.();
        onSuccess();
      }).catch(e => MessageUtil.error(op + "失败", e))
    }
  })
}