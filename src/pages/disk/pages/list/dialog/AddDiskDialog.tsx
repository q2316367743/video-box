import {
  Button,
  DialogPlugin,
  DrawerPlugin,
  Form,
  FormItem,
  Input,
  Radio,
  RadioGroup,
  TreeNodeModel, TreeOptionData, TreeProps, TreeSelect
} from "tdesign-vue-next";
import {DiskDriver, DiskFromAList, DiskFromWebDAV, DiskSourceForm} from "@/entities/disk/DiskSource";
import {useDiskSourceStore} from "@/store/db/DiskSourceStore";
import MessageUtil from "@/utils/modal/MessageUtil";
import {buildDiskPlugin} from "@/modules/disk";
import {clone} from "@/utils/lang/ObjUtil";


function openChoosePathDialog(data: DiskSourceForm<DiskDriver>): Promise<string> {
  let plugin = buildDiskPlugin(clone({
    ...data,
    path: ''
  }, true));
  const options = ref(new Array<TreeOptionData>());
  const path = ref('');
  // 初始化
  plugin.readDir('/').then((files) => {
    options.value = files.map(f => ({
      label: f.name,
      value: f.path,
      children: f.isDirectory,
    }))
  })
  const loadFunc: TreeProps['load'] = async (node: TreeNodeModel): Promise<Array<TreeOptionData>> => {
    const files = await plugin.readDir(node.value as string);
    return files.map(f => ({
      label: f.name,
      value: f.path,
      children: f.isDirectory,
    }))
  }
  return new Promise<string>((resolve) => {
    const dp = DialogPlugin({
      header: "选择目录",
      placement: "center",
      draggable: true,
      default: () => <TreeSelect
        v-model={path.value}
        data={options.value}
        clearable={true}
        placeholder={"请选择"}
        treeProps={{
          load: loadFunc,
        }}/>,
      onConfirm() {
        dp.destroy?.()
        resolve(path.value)
      }
    })
  })
}

export function openAddDiskDialog() {
  const data = ref<DiskSourceForm<DiskDriver>>({
    type: 'movie',
    title: '',
    driver: 'A_LIST',
    data: {
      url: '',
      authorization: ''
    },
    path: ''
  });
  const choosePath = () => {
    openChoosePathDialog(data.value).then((path) => {
      data.value.path = path
    }).catch((e) => {
      MessageUtil.error('选择目录失败', e)
    })
  }
  const dp = DrawerPlugin({
    header: '新增云盘',
    size: '400px',
    default: () => <Form data={data.value}>
      <FormItem label={'媒体类型'} labelAlign={'top'}>
        <RadioGroup v-model={data.value.type}>
          <Radio value={'movie'} label={'电影'}/>
          <Radio value={'tvshow'} label={'剧集'}/>
        </RadioGroup>
      </FormItem>
      <FormItem label={'标题'} labelAlign={'top'}>
        <Input v-model={data.value.title}/>
      </FormItem>
      <FormItem label={'驱动'} labelAlign={'top'}>
        <RadioGroup v-model={data.value.driver}>
          <Radio value={'A_LIST'} label={'AList V3'}/>
          <Radio value={'WEB_DAV'} label={'WebDAV'}/>
        </RadioGroup>
      </FormItem>
      <FormItem label={'URL'} labelAlign={'top'}>
        <Input v-model={data.value.data.url}/>
      </FormItem>
      {data.value.driver === "A_LIST" && <FormItem label={'token'} labelAlign={'top'}>
        <Input v-model={(data.value.data as DiskFromAList).authorization}/>
      </FormItem>}
      {data.value.driver === "WEB_DAV" && <>
        <FormItem label={'用户名'} labelAlign={'top'}>
          <Input v-model={(data.value.data as DiskFromWebDAV).username}/>
        </FormItem>
        <FormItem label={'密码'} labelAlign={'top'}>
          <Input v-model={(data.value.data as DiskFromWebDAV).password} type={'password'}/>
        </FormItem></>}
      <FormItem label={'路径'} labelAlign={'top'}>
        <Input v-model={data.value.path} readonly>{{
          suffix: () => <Button theme={'primary'} variant={'text'} onClick={choosePath}>选择目录</Button>
        }}</Input>
      </FormItem>
    </Form>,
    onConfirm() {
      useDiskSourceStore().add(data.value).then(() => {
        MessageUtil.success('添加成功')
        dp.destroy?.()
      }).catch((e) => {
        MessageUtil.error('添加失败', e)
      })
    }
  })
}