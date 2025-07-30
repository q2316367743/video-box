<template>
  <t-form :data="data">
    <t-form-item v-for="p in params" :key="p.field" :label="p.label" :help="p.help" :required-mark="p.required"
                 :rules="p.rules">
      <t-input v-if="p.type === 'input'" v-model="data[p.field]" :placeholder="p.placeholder"
               :default-value="p.defaultValue"/>
      <t-input v-else-if="p.type === 'password'" v-model="data[p.field]" type="password" :placeholder="p.placeholder"
               :default-value="p.defaultValue"/>
      <t-textarea v-else-if="p.type === 'textarea'" v-model="data[p.field]" :placeholder="p.placeholder"
                  :default-value="p.defaultValue"/>
      <t-input-number v-else-if="p.type === 'number'" v-model="data[p.field]" placeholder="请输入"
                      :default-value="p.defaultValue"/>
      <t-switch v-else-if="p.type === 'switch'" v-model="data[p.field]" :default-value="p.defaultValue"/>
      <t-select v-else-if="p.type === 'select'" v-model="data[p.field]" :placeholder="p.placeholder"
                :default-value="p.defaultValue">
        <t-option v-for="o in p.options" :key="o.value" :value="o.value">{{ o.label }}</t-option>
      </t-select>
      <t-radio-group v-else-if="p.type === 'radio'" v-model="data[p.field]" :default-value="p.defaultValue">
        <t-radio v-for="o in p.options" :key="o.value" :value="o.value">{{ o.label }}</t-radio>
      </t-radio-group>
      <t-tag-input v-else-if="p.type === 'tag'" v-model="data[p.field]" :placeholder="p.placeholder"
                   :default-value="p.defaultValue"/>
      <t-checkbox-group v-else-if="p.type === 'checkout'" v-model="data[p.field]" :default-value="p.defaultValue">
        <t-checkbox v-for="o in p.options" :key="o.value" :value="o.value">{{ o.label }}</t-checkbox>
      </t-checkbox-group>
    </t-form-item>
  </t-form>
</template>
<script lang="ts" setup>
import {CustomForm} from "@/views/CustomForm.ts";

defineProps({
  params: {
    type: Object as PropType<Array<CustomForm>>,
    default: () => []
  }
});

const data = defineModel({
  type: Object
});
</script>
<style scoped lang="less">

</style>
