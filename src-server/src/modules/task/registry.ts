import {TaskExecution} from "@/types/Task";

export const running   = new Map<string, TaskExecution>(); // identifier -> execution
export const abortCtl  = new Map<string, AbortController>(); // identifier -> AbortController