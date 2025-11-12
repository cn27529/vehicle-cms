<template>
  <div id="app">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
        <div class="logo">
          <el-icon><Menu /></el-icon>
          <span v-if="!isCollapse">汽車保養記錄</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>儀表板</template>
          </el-menu-item>
          <el-menu-item index="/vehicles">
            <el-icon><Van /></el-icon>
            <template #title>車輛列表</template>
          </el-menu-item>
          <el-menu-item index="/maintenance">
            <el-icon><Calendar /></el-icon>
            <template #title>保養記錄</template>
          </el-menu-item>
          <el-menu-item index="/statistics">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>統計數據</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <!-- 头部 -->
        <el-header class="header">
          <div class="header-left">
            <el-button
              type="text"
              :icon="isCollapse ? 'expand' : 'fold'"
              @click="toggleSidebar"
              class="collapse-btn"
            ></el-button>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首頁</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentRouteName }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-avatar :size="32" :src="userAvatar" />
                <span class="user-name">車主</span>
                <i class="el-icon-arrow-down"></i>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">個人資料</el-dropdown-item>
                  <el-dropdown-item command="settings">設定</el-dropdown-item>
                  <el-dropdown-item divided command="logout">登出</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 内容区域 -->
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { DataAnalysis } from "@element-plus/icons-vue";
import { ref, computed } from "vue";
import { useRoute } from "vue-router";

export default {
  name: "App",
  setup() {
    const isCollapse = ref(false);
    const route = useRoute();
    const userAvatar = ref("");

    const activeMenu = computed(() => route.path);
    
    const currentRouteName = computed(() => {
      const routeMap = {
        "/dashboard": "儀表板",
        "/vehicles": "車輛列表",
        "/maintenance": "保養記錄"
      };
      return routeMap[route.path] || "首頁";
    });

    const toggleSidebar = () => {
      isCollapse.value = !isCollapse.value;
    };

    const handleCommand = (command) => {
      switch (command) {
        case "logout":
          console.log("登出");
          break;
        case "profile":
          console.log("個人資料");
          break;
        case "settings":
          console.log("設定");
          break;
      }
    };

    return {
      isCollapse,
      activeMenu,
      currentRouteName,
      userAvatar,
      toggleSidebar,
      handleCommand,
    };
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  height: 100vh;
}

.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #2b3847;
}

.logo i {
  font-size: 24px;
  margin-right: 8px;
}

.sidebar-menu {
  border: none;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  border-bottom: 1px solid #e6e6e6;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  font-size: 18px;
  margin-right: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-name {
  margin: 0 8px;
  font-size: 14px;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .header {
    padding: 0 10px;
  }
  
  .main-content {
    padding: 10px;
  }
  
  .user-name {
    display: none;
  }
}
</style>