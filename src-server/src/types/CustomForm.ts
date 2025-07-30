type CustomFormType = 'input' | 'password' | 'textarea' | 'select' | 'number' | 'checkout' | 'radio' | 'tag'

interface CustomFormCommon {
  label: string;
  field: string;
  type: CustomFormType;
  placeholder?: string;
  required?: boolean;
  rules?: Array<{
    required: boolean;
    message: string;
    trigger: string;
  }>;
  help?: string;
  defaultValue?: any;
}

interface CustomFormInput extends CustomFormCommon {
  type: 'input';
}

interface CustomFormPassword extends CustomFormCommon {
  type: 'password';
}

interface CustomFormTextarea extends CustomFormCommon {
  type: 'textarea';
}

interface CustomFormSelect extends CustomFormCommon {
  type: 'select';
  options: Array<{
    label: string;
    value: string;
  }>;
}

interface CustomFormRadio extends CustomFormCommon {
  type: 'radio';
  options: Array<{
    label: string;
    value: string;
  }>;
}

interface CustomFormCheckout extends CustomFormCommon {
  type: 'checkout';
  options: Array<{
    label: string;
    value: string;
  }>;
}

interface CustomFormNumber {
  type: 'number';
  min?: number;
  max?: number;
}

interface CustomFormTag {
  type: 'tag';
}

// 自定义表单
export type CustomForm =
  CustomFormInput
  | CustomFormPassword
  | CustomFormTextarea
  | CustomFormRadio
  | CustomFormCheckout
  | CustomFormNumber
  | CustomFormTag
  | CustomFormSelect;