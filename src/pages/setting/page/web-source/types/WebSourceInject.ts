import {Folder} from "@/views/Folder";


export interface WebSourceInjectKeyType {
  folders: Ref<Array<Folder>>
}

export const WebSourceInjectKey = Symbol() as InjectionKey<WebSourceInjectKeyType>