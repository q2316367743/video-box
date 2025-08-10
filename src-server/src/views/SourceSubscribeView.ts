import {SourceSubscribe, SourceSubscribeGroup} from "@/types/SourceSubscribe";

export interface SourceSubscribeGroupView extends SourceSubscribeGroup{
  items: Array<SourceSubscribe>;
}