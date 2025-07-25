import {Folder} from "@/views/Folder.js";


export interface WebSourceInjectKeyType {
  folders: Ref<Array<Folder>>
}

export const WebSourceInjectKey = Symbol() as InjectionKey<WebSourceInjectKeyType>