import {useDelete, useGet, usePost, usePut} from "@/apis/common.ts";
import {CustomForm} from "@/views/CustomForm.ts";
import {DiskDriver, DiskSourceEntry, DiskSourceFormData} from "@/types/SourceDisk.ts";


export function adminSourceDiskProps() {
  return useGet<{
    options: Array<{ label: string, value: DiskDriver }>,
    props: Record<DiskDriver, Array<CustomForm>>
  }>('/api/admin/source/disk/props')
}

export function adminSourceDiskList() {
  return useGet<Array<DiskSourceEntry>>('/api/admin/source/disk/list')
}

export function adminSourceDiskAdd(data: DiskSourceFormData) {
  return usePost('/api/admin/source/disk/add', data)
}

export function adminSourceDiskUpdate(id: string, data: DiskSourceFormData) {
  return usePut(`/api/admin/source/disk/update/${id}`, data)
}

export function adminSourceDiskDelete(id: string) {
  return useDelete(`/api/admin/source/disk/delete/${id}`)
}

export function adminSourceDiskOrder(body: Array<{ id: string, order: number }>) {
  return usePut<DiskSourceEntry>(`/api/admin/source/disk/order`, body);
}