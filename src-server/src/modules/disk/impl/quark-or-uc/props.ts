import {CustomForm} from "@/types/CustomForm";

export const DiskPropsForQuarkOrUc: Array<CustomForm> = [{
  type: 'input',
  label: 'Cookie',
  field: 'Cookie',
  placeholder: '请输入Cookie',
  required: true,
}, {
  type: 'input',
  label: '根目录ID',
  field: 'RootID',
}, {
  type: 'select',
  label: '排序',
  field: 'OrderBy',
  defaultValue: 'none',
  options: [{
    label: '不排序',
    value: 'none',
  }, {
    label: '文件类型',
    value: 'file_type',
  }, {
    label: '文件名字',
    value: 'file_name',
  }, {
    label: '修改时间',
    value: 'updated_at',
  }, {
    label: '创建时间',
    value: 'created_at',
  }],
}, {
  type: 'select',
  label: '排序方式',
  field: 'OrderDirection',
  defaultValue: 'asc',
  options: [{
    label: '升序',
    value: 'asc',
  }, {
    label: '降序',
    value: 'desc',
  }]
}, {
  type: 'switch',
  label: '使用转换编码地址',
  field: 'UseTransCodingAddress',
  defaultValue: false,
  help: '您可以观看转码后的视频，并支持302重定向。'
}, {
  type: 'switch',
  label: '仅列出视频文件',
  field: 'OnlyListVideoFile',
  defaultValue: false,
}, {
  type: 'number',
  label: '增订版',
  field: 'AdditionVersion',
}]