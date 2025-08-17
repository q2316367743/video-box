import { AiToolSession, AiToolMessage, AiToolSessionCore } from "@/types/AiTool";
import { useDelete, useGet, usePost } from "../common";

export function toolChatList() {
  return useGet<AiToolSession[]>('/api/tool/chat/list');
}

export function toolChatCreate(body: AiToolSessionCore) {
  return usePost<string>('/api/tool/chat/create', body);
}

export function toolChatMessageList(sessionId: string) {
  return useGet<AiToolMessage[]>(`/api/tool/chat/message/${sessionId}`);
}

export function toolChatDelete(sessionId: string) {
  return useDelete(`/api/tool/chat/delete/${sessionId}`);
}