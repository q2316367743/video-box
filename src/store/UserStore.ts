import { defineStore } from "pinia";
import { authLogin } from "@/apis/auth";
import { router } from "@/plugin/router";
import { useDictStore } from "@/store/DictStore.ts";
import { useCookies } from "@vueuse/integrations/useCookies";

export const useUserStore = defineStore("user", () => {
  const token = useLocalStorage('token', "");
  const { set } = useCookies(['']);

  watch(token, val => set('authorization', val), { immediate: true });

  const login = (username: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      authLogin(username, password)
        .then(data => {
          if (data.success) {
            token.value = data.token;
            resolve();
            // 初始化字典
            useDictStore().init();
          } else {
            reject(data.message);
          }
        })
    })
  }

  const logout = async () => {
    token.value = "";
    await router.replace({
      path: '/auth/login',
      query: {
        redirect: router.currentRoute.value.path
      }
    });
  }

  const getDiskUrl = (sourceId: string, path: string) => {
    return `/api/proxy/disk/${sourceId}/p${path}?authorization=${token.value}`
  }

  return { token, logout, login, getDiskUrl }

})