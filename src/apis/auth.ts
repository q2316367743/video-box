import {usePost} from "@/apis/common.js";

interface AUthLoginData {
  success: boolean;
  message: string;
  token: string;
}

export function authLogin(username: string, password: string) {
  return usePost<AUthLoginData>('/api/auth/login', {username, password})
}