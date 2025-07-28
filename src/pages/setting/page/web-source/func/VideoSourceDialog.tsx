import {DialogPlugin, Form, FormItem, Input, LoadingPlugin, Radio, RadioGroup, Select} from "tdesign-vue-next";
import MessageUtil from "@/utils/modal/MessageUtil";
import {SourceWebForm} from "@/views/SourceWeb";
import {sourceWebInfo} from "@/apis/source/web";
import {adminSourceWebAdd, adminSourceWebUpdate} from "@/apis/admin/source/web";
import {SourceWebTypeEnum, sourceWebTypeOptions} from "@/enum/SourceWebTypeEnum";
import VideoFormForCmsJson from "@/modules/video/impl/cms-json/VideoFormForCmsJson.vue";
import VideoFormForEmby from "@/modules/video/impl/emby/VideoFormForEmby.vue";
import VideoFormForCmsXml from "@/modules/video/impl/cms-xml/VideoFormForCmsXml.vue";

export function openVideoSourceDialog(update: () => void, old?: string) {
  const op = !!old ? '更新' : '新增';
  const data = ref<SourceWebForm>({
    title: '',
    type: SourceWebTypeEnum.CMS_JSON,
    props: {
      url: ''
    },
    favicon: '',
    folder: '',
    order: 0
  });
  if (old) {
    sourceWebInfo(old).then(res => data.value = res);
  }
  const iconType = ref(2);
  const dp = DialogPlugin({
    header: op + '网络资源',
    placement: "center",
    width: 600,
    default: () => <Form data={data.value}>
      <FormItem label="名称" name={'title'} required-mark rules={[{required: true}]}>
        <Input v-model={data.value.title}/>
      </FormItem>
      <FormItem label="类型" name={'type'} required-mark rules={[{required: true}]}>
        <Select options={sourceWebTypeOptions} v-model={data.value.type}/>
      </FormItem>
      <FormItem label="图标" name={'type'} required-mark>
        <RadioGroup v-model={iconType.value}>
          <Radio value={2} label={'文字图标'}/>
          <Radio value={1} label={'自动获取'}/>
          <Radio value={3} label={'自定义'}/>
        </RadioGroup>
      </FormItem>
      {iconType.value === 3 && <FormItem label="图标地址" name={'type'} required-mark>
        <Input v-model={data.value.favicon}/>
      </FormItem>}
      {data.value.type === SourceWebTypeEnum.CMS_JSON ?
        <VideoFormForCmsJson v-model={data.value.props}/> :
        data.value.type === SourceWebTypeEnum.CMS_XML ?
          <VideoFormForCmsXml v-model={data.value.props}/> :
          data.value.type === SourceWebTypeEnum.EMBY ?
            <VideoFormForEmby v-model={data.value.props}/> :
            <span>类型未知</span>}
    </Form>,
    confirmBtn: op,
    onConfirm() {
      const lp = LoadingPlugin({
        text: '正在' + op + '...',
        fullscreen: true,
        zIndex: 2000
      });
      (!!old ? adminSourceWebUpdate(old, data.value) : adminSourceWebAdd(data.value))
        .then(() => {
          MessageUtil.success(op + "成功");
          dp.destroy();
          update()
        })
        .finally(() => {
          lp.hide();
        });
    }
  })
}