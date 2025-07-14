import {DialogPlugin, Form, FormItem, Input, LoadingPlugin, Radio, RadioGroup, Select} from "tdesign-vue-next";
import {VideoSourceEntry, videoSourceTypeOptions} from "@/entities/VideoSource.ts";
import {useVideoSourceStore} from "@/store/index.ts";
import MessageUtil from "@/utils/modal/MessageUtil.ts";
import VideoFormForCms from "@/modules/video/impl/cms/VideoFormForCms.vue";
import VideoFormForEmby from "@/modules/video/impl/emby/VideoFormForEmby.vue";

export function openVideoSourceDialog(old?: VideoSourceEntry) {
  const op = !!old ? '更新' : '新增';
  const data = ref<VideoSourceEntry>(old || {
    id: '',
    createTime: 0,
    updateTime: 0,
    title: '',
    type: 'CMS:JSON',
    props: {
      url: ''
    },
    favicon: '',
    folder: '',
    order: 0
  });
  const iconType = ref(1);
  const dp = DialogPlugin({
    header: op + '网络资源',
    placement: "center",
    width: 600,
    default: () => <Form data={data.value}>
      <FormItem label="名称" name={'title'} required-mark rules={[{required: true}]}>
        <Input v-model={data.value.title}/>
      </FormItem>
      <FormItem label="类型" name={'type'} required-mark rules={[{required: true}]}>
        <Select options={videoSourceTypeOptions} v-model={data.value.type}/>
      </FormItem>
      <FormItem label="图标" name={'type'} required-mark>
        <RadioGroup v-model={iconType.value}>
          <Radio value={1} label={'自动获取'}/>
          <Radio value={2} label={'文字图标'}/>
          <Radio value={3} label={'自定义'}/>
        </RadioGroup>
      </FormItem>
      {iconType.value === 3 && <FormItem label="图标地址" name={'type'} required-mark>
        <Input v-model={data.value.favicon}/>
      </FormItem>}
      {data.value.type === 'CMS:JSON' ?
        <VideoFormForCms v-model={data.value.props}/> :
        data.value.type === 'EMBY' ?
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
      (!!old ? useVideoSourceStore().update : useVideoSourceStore().add)(data.value, iconType.value)
        .then(() => {
          MessageUtil.success(op + "成功");
          dp.destroy();
        })
        .catch(e => MessageUtil.error(op + "失败", e))
        .finally(() => {
          lp.hide();
        });
    }
  })
}