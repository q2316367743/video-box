import {defineStore} from "pinia";
import {adminSourceDiskProps} from "@/apis/admin/source/disk.ts";
import {DiskDriver} from "@/types/SourceDisk.ts";
import {CustomForm} from "@/views/CustomForm.ts";

export const useDictStore = defineStore('dict', () => {
  const diskOptions = useLocalStorage<Array<{ label: string, value: DiskDriver }>>('/dict/disk/options', []);
  const diskProps = useLocalStorage<Record<DiskDriver | string, Array<CustomForm>>>('/dict/disk/props', {});

  const diskNameMap = computed(() => diskOptions.value.reduce((pre, currentValue) => {
    pre[currentValue.value] = currentValue.label;
    return pre;
  }, {} as Record<string, string>))

  const init = async () => {
    const disk = await adminSourceDiskProps();
    diskProps.value = disk.props;
    diskOptions.value = disk.options;
  }

  return {
    diskOptions,
    diskProps,
    diskNameMap,
    init
  }


})