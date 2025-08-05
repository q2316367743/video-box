import { TaskDefinition, TaskExecution } from "@/types/Task";
import { PageResponse, useGet, usePost, useDelete } from "../common";

export function adminTaskPreset(id: string) {
    return usePost(`/api/admin/task/preset/${id}/run`);
}

export function adminTaskStop(id: string) {
    return useDelete(`/api/admin/task/stop/${id}`);
}

export function adminTaskDefinitionPage(pageNum: number,pageSize: number) {
    return useGet<PageResponse<TaskDefinition>>('/api/admin/task/definitions', {
        pageNum, pageSize
    })
}

export function adminTaskExecutionPage(id: string, pageNum: number,pageSize: number) {
    return useGet<PageResponse<TaskExecution>>(`/api/admin/task/executions/${id}`, {
        pageNum, pageSize
    })
}