import {CustomForm} from "@/types/CustomForm";

export const DiskPropsForAListV3: Array<CustomForm> = [{
  label: 'url',
  field: 'url',
  type: 'input',
  placeholder: '请输入URL',
  required: true,
  rules: [{
    required: true,
    message: '请输入URL',
    trigger: 'blur'
  }]
}, {
  label: 'authorization',
  field: 'authorization',
  type: 'password',
  placeholder: '请输入密钥',
  required: true,
  help: '前往Alist后台中获取'
}]