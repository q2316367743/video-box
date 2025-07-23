<style scoped>
.form {
  padding: 20px;
  background: lightgrey;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 20px;
  border-radius: 5px;
  border: 2px solid var(--td-gray-color-13);
  box-shadow: 4px 4px var(--td-gray-color-13);
  width: 300px;
  margin: 0 auto;
}

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
}

.input {
  width: 250px;
  height: 40px;
  border-radius: 5px;
  border: 2px solid var(--td-gray-color-13);
  background-color: var(--td-bg-color-container);
  box-shadow: 4px 4px var(--td-gray-color-13);
  font-size: 15px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  padding: 5px 10px;
  outline: none;
}

.input::placeholder {
  color: var(--td-text-color-secondary);
  opacity: 0.8;
}

.input:focus {
  border: 2px solid var(--td-brand-color);
}

.button-confirm:active {
  box-shadow: 0 0 var(--td-gray-color-13);
  transform: translate(3px, 3px);
}

.button-confirm {
  margin: 50px auto 0 auto;
  width: 120px;
  height: 40px;
  border-radius: 5px;
  border: 2px solid var(--td-gray-color-13);
  background-color: var(--td-bg-color-container);
  box-shadow: 4px 4px var(--td-gray-color-13);
  font-size: 17px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  cursor: pointer;
}
</style>

<template>
  <div class="form">
    <div>
      <div class="title">欢迎,</div>
      <div class="subtitle"><span>登录</span><span>影视盒子</span></div>
    </div>
    <input v-model="username" type="text" placeholder="用户名" name="username" class="input">
    <input v-model="password" type="password" placeholder="密码" name="password" class="input">
    <button class="button-confirm" @click="handleSubmit">Let`s go →</button>
  </div>
</template>
<script setup lang="ts">
import MessageUtil from "@/utils/modal/MessageUtil.js";
import {useUserStore} from "@/store/UserStore.js";

const route = useRoute();
const router = useRouter();

const username = ref('');
const password = ref('');

const handleSubmit = () => {
  useUserStore().login(username.value, password.value)
    .then(() => router.push(route.query.redirect || '/'))
    .catch(MessageUtil.error);
}
</script>