import {defineStore} from "pinia";
import {authLogin} from "@/apis/auth";
import {router} from "@/plugin/router";

export const useUserStore = defineStore("user", () => {
  const token = useLocalStorage('token', "");

  const login = (username: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      authLogin(username, password)
        .then(data => {
          if (data.success) {
            token.value = data.token;
            resolve();
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

  return {token, logout, login}

})