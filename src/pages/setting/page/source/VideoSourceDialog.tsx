import {DialogPlugin, Form, FormItem, Input, Select} from "tdesign-vue-next";
import {VideoSourceEntry, videoSourceTypeOptions} from "@/entities/VideoSource";
import {useSnowflake} from "@/hooks/Snowflake";
import VideoFormForCms from "@/core/impl/cms/VideoFormForCms.vue";
import {useSourceStore} from "@/store";
import MessageUtil from "@/utils/modal/MessageUtil";
import VideoFormForEmby from "@/core/impl/emby/VideoFormForEmby.vue";

export function openVideoSourceDialog(old?: VideoSourceEntry) {
  const op = !!old ? '更新' : '新增';
  const data = ref<VideoSourceEntry>(old || {
    id: useSnowflake().nextId(),
    createTime: Date.now(),
    updateTime: Date.now(),
    title: '',
    type: 'CMS',
    props: {
      url: ''
    }
  })
  const dp = DialogPlugin({
    header: op + '视频源',
    placement: "center",
    width: 600,
    default: () => <Form data={data.value}>
      <FormItem label="视频源名称" name={'title'} required-mark rules={[{required: true}]}>
        <Input v-model={data.value.title}/>
      </FormItem>
      <FormItem label="视频源类型" name={'title'} required-mark rules={[{required: true}]}>
        <Select options={videoSourceTypeOptions} v-model={data.value.type}/>
      </FormItem>
      {data.value.type === 'CMS' ?
        <VideoFormForCms v-model={data.value.props}/> :
        data.value.type === 'EMBY' ?
          <VideoFormForEmby v-model={data.value.props}/> :
          <span>视频源类型未知</span>}
    </Form>,
    confirmBtn: op,
    onConfirm() {
      (!!old ? useSourceStore().update : useSourceStore().add)(data.value)
        .then(() => {
          MessageUtil.success(op + "成功");
          dp.destroy();
        })
        .catch(e => MessageUtil.error(op + "失败", e));
    }
  })
}