import { defineStore } from "pinia";
import { TdBreadcrumbProps } from "tdesign-vue-next";

export const useToolBreadcrumbStore = defineStore('tool-breadcrumb', () => {

  const title = ref('');

  const options = computed<TdBreadcrumbProps["options"]>(() => {
    return [
      { content: 'AI工具', to: '/tools/list' },
      { content: title.value }
    ];
  });

  const setTitle = (value: string) => {
    title.value = value;
  };

  return {
    options,
    setTitle
  };
})