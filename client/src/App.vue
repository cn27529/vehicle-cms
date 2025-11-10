<template>
  <a-config-provider :locale="locale">
    <a-layout style="min-height: 100vh">
      <a-layout-sider
        v-model:collapsed="collapsed"
        :trigger="null"
        collapsible
        breakpoint="lg"
        @breakpoint="onBreakpoint"
      >
        <div class="logo">
          <h2 v-if="!collapsed" style="color: white; margin: 16px; text-align: center">
            汽車保修系統
          </h2>
          <h2 v-else style="color: white; margin: 16px; text-align: center">⚙️</h2>
        </div>
        <a-menu
          v-model:selectedKeys="selectedKeys"
          theme="dark"
          mode="inline"
          :items="menuItems"
        />
      </a-layout-sider>
      <a-layout>
        <a-layout-header style="background: #fff; padding: 0 16px">
          <menu-unfold-outlined
            v-if="collapsed"
            class="trigger"
            @click="() => (collapsed = !collapsed)"
          />
          <menu-fold-outlined v-else class="trigger" @click="() => (collapsed = !collapsed)" />
          <span style="margin-left: 16px">汽車保修管理系統</span>
        </a-layout-header>
        <a-layout-content style="margin: 16px">
          <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
            <router-view />
          </div>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-config-provider>
</template>

<script setup>
import { ref, watch, computed, h } from "vue";
import { useRoute, useRouter } from "vue-router";
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined,
  TeamOutlined,
  CarOutlined
} from "@ant-design/icons-vue";
import zhCN from "ant-design-vue/es/locale/zh_TW";

const route = useRoute();
const router = useRouter();
const collapsed = ref(false);
const selectedKeys = ref([route.path]);

const locale = zhCN;

const menuItems = computed(() => [
  {
    key: "/admin/vehicles",
    icon: () => h(TeamOutlined),
    label: "車輛管理",
    onClick: () => router.push("/admin/vehicles")
  },
  {
    key: "/mycar",
    icon: () => h(CarOutlined),
    label: "我的車輛",
    onClick: () => router.push("/mycar")
  }
]);

watch(
  () => route.path,
  (newPath) => {
    selectedKeys.value = [newPath];
  }
);

const onBreakpoint = (broken) => {
  if (broken) {
    collapsed.value = true;
  }
};
</script>