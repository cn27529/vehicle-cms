<!-- src/views/Login.vue -->
<template>
  <div class="login-container">
    <a-card title="登入" class="login-card">
      <a-form :model="loginForm" layout="vertical">
        <a-form-item label="帳號">
          <a-input v-model:value="loginForm.username" placeholder="輸入帳號" />
        </a-form-item>
        <a-form-item label="密碼">
          <a-input-password v-model:value="loginForm.password" placeholder="輸入密碼" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" block @click="handleLogin">登入</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const loginForm = ref({
  username: "",
  password: ""
});

const handleLogin = () => {
  // 實際專案中這裡會有登入邏輯
  console.log("登入:", loginForm.value);
  router.push("/");
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
}
</style>