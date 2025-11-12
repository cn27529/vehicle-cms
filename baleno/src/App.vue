<template>
  <a-config-provider :locale="zhTW">
    <div id="app">
      <a-layout style="min-height: 100vh">
        <a-layout-header class="header">
          <div class="logo">
            <car-outlined />
            <span>汽車保養管理系統</span>
          </div>
          <a-menu
            v-model:selectedKeys="selectedKeys"
            theme="dark"
            mode="horizontal"
            :style="{ lineHeight: '64px' }"
          >
            <a-menu-item key="dashboard">
              <router-link to="/">
                <dashboard-outlined />
                儀表板
              </router-link>
            </a-menu-item>
            <a-menu-item key="vehicles">
              <router-link to="/vehicles">
                <car-outlined />
                車輛管理
              </router-link>
            </a-menu-item>
          </a-menu>
        </a-layout-header>
        
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>
    </div>
  </a-config-provider>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { CarOutlined, DashboardOutlined } from "@ant-design/icons-vue";
import zhTW from "ant-design-vue/es/locale/zh_TW";

const route = useRoute();
const selectedKeys = ref(["dashboard"]);

watch(
  () => route.path,
  (newPath) => {
    if (newPath === "/") {
      selectedKeys.value = ["dashboard"];
    } else if (newPath.startsWith("/vehicles")) {
      selectedKeys.value = ["vehicles"];
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.logo {
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.logo span {
  margin-left: 8px;
}

.content {
  padding: 24px;
  background: #f0f2f5;
}
</style>