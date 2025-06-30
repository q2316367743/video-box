import {DialogPlugin, Form, FormItem, Input, Select} from "tdesign-vue-next";
import {VideoSourceEntry, videoSourceTypeOptions} from "@/entities/VideoSource";
import {useSnowflake} from "@/hooks/Snowflake";
import VideoFormForCms from "@/core/impl/cms/VideoFormForCms.vue";
import {useSourceStore} from "@/store";
import MessageUtil from "@/utils/modal/MessageUtil";

export function openVideoSourceDialog() {
  const data = ref<VideoSourceEntry>({
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
    header: '新增视频源',
    placement: "center",
    width: 600,
    default: () => <Form data={data.value}>
      <FormItem label="视频源名称" name={'title'} required-mark rules={[{required: true}]}>
        <Input v-model={data.value.title}/>
      </FormItem>
      <FormItem label="视频源类型" name={'title'} required-mark rules={[{required: true}]}>
        <Select options={videoSourceTypeOptions} v-model={data.value.type}/>
      </FormItem>
      {data.value.type === 'CMS' ? <VideoFormForCms v-model={data.value.props}/> : <span>视频源类型未知</span>}
    </Form>,
    confirmBtn: '新增',
    onConfirm() {
      useSourceStore().add(data.value)
        .then(() => {
          MessageUtil.success("新增成功");
          dp.destroy();
        })
        .catch(e => MessageUtil.error("新增失败", e));
    }
  })
}