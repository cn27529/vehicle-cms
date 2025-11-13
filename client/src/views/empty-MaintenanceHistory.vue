<template>
  <div class="maintenance-history-container">
    <h1>MaintenanceHistory 测试页面</h1>
    <p>如果这个页面能正常显示，说明路由和组件挂载正常</p>
    
    <div v-if="loading">加载中...</div>
    <div v-else>
      <p>页面加载完成</p>
      <p>手机参数: {{ ownerPhone }}</p>
      <p>车辆数量: {{ vehicles.length }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useVehicleStore } from "../stores/vehicles";

export default {
  name: "MaintenanceHistory",
  props: {
    phone: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    console.log("🔧 MaintenanceHistory setup 开始执行");
    
    const route = useRoute();
    const router = useRouter();
    const vehicleStore = useVehicleStore();
    const loading = ref(true);

    // 从路由参数获取手机号码
    const ownerPhone = computed(() => {
      if (props.phone) {
        return props.phone;
      }
      return route.params.phone || "";
    });

    const vehicles = computed(() => {
      return vehicleStore.allVehicles || [];
    });

    const initialize = async () => {
      try {
        console.log("🔄 MaintenanceHistory 初始化开始...");
        loading.value = true;
        
        // 确保 store 已初始化
        await vehicleStore.initialize();
        console.log("🔧 Store 初始化完成，车辆数量:", vehicleStore.allVehicles.length);
        
        console.log("✅ MaintenanceHistory 初始化完成");
      } catch (err) {
        console.error("❌ MaintenanceHistory 初始化错误:", err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      console.log('🔧 MaintenanceHistory mounted - 这个应该被打印出来');
      console.log('🔧 路由参数:', route.params);
      console.log('🔧 Props 参数:', props);
      console.log('🔧 完整路由:', route);
      
      initialize();
    });

    return {
      ownerPhone,
      vehicles,
      loading,
    };
  },
};
</script>

<style scoped>
.maintenance-history-container {
  padding: 20px;
  text-align: center;
}
</style>