<style scoped lang="less">
.auth-login-form {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 20px;
  border-radius: 5px;
  border: 1px solid var(--td-border-level-2-color);
  box-shadow: var(--td-shadow-1);
  width: 300px;
  margin: 15vh auto 0;
  background-color: var(--td-bg-color-component);

  .title {
    color: var(--td-text-color-primary);
    font-weight: 900;
    font-size: 20px;
  }

  .subtitle {
    color: var(--td-text-color-secondary);
    font-weight: 600;
    font-size: 17px;
    margin-bottom: 25px;

    .brand-name {
      color: var(--td-brand-color);
    }
  }
}


</style>

<template>
  <div class="auth-login-form">
    <div>
      <div class="title">欢迎,</div>
      <div class="subtitle"><span>登录</span>「<span class="brand-name">影视盒子</span>」</div>
    </div>
    <t-input v-model="username" size="large" type="text" placeholder="用户名">
      <template #prefix-icon>
        <user-icon/>
      </template>
    </t-input>
    <t-input v-model="password" size="large" type="password" placeholder="密码">
      <template #prefix-icon>
        <lock-on-icon/>
      </template>
    </t-input>
    <t-button block size="large" @click="handleSubmit">Let`s go →</t-button>
  </div>
</template>
<script setup lang="ts">
import MessageUtil from "@/utils/modal/MessageUtil.js";
import {useUserStore} from "@/store/UserStore.js";
import {LockOnIcon, UserIcon} from "tdesign-icons-vue-next";

const route = useRoute();
const router = useRouter();

const username = ref('');
const password = ref('');

const handleSubmit = () => {
  useUserStore().login(username.value, password.value)
    .then(() => router.push(route.query.redirect as string || '/'))
    .catch(MessageUtil.error);
}
</script>