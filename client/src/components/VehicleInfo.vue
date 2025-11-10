<template>
  <a-card title="車輛基本資訊" class="vehicle-info-card">
    <a-descriptions :column="2" bordered>
      <a-descriptions-item label="車牌號碼">{{ vehicle.vehicle_info.license_plate }}</a-descriptions-item>
      <a-descriptions-item label="廠牌">{{ vehicle.vehicle_info.brand }}</a-descriptions-item>
      <a-descriptions-item label="車型">{{ vehicle.vehicle_info.model }}</a-descriptions-item>
      <a-descriptions-item label="年份">{{ vehicle.vehicle_info.year }}</a-descriptions-item>
      <a-descriptions-item label="引擎代碼">{{ vehicle.vehicle_info.engine_code }}</a-descriptions-item>
      <a-descriptions-item label="顏色">{{ vehicle.vehicle_info.color }}</a-descriptions-item>
      <a-descriptions-item label="目前里程">{{ vehicle.vehicle_info.current_mileage }} 公里</a-descriptions-item>
      <a-descriptions-item label="製造日期">{{ formatDate(vehicle.vehicle_info.manufacture_date) }}</a-descriptions-item>
      <a-descriptions-item label="購買日期">{{ formatDate(vehicle.vehicle_info.purchase_date) }}</a-descriptions-item>
      <a-descriptions-item label="最後更新">{{ formatDate(vehicle.vehicle_info.last_updated) }}</a-descriptions-item>
    </a-descriptions>
    
    <a-divider />
    
    <a-card title="聯絡資訊" size="small">
      <a-descriptions :column="1">
        <a-descriptions-item label="電話">{{ vehicle.vehicle_info.phone }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
  </a-card>
</template>

<script setup>
import { formatDate } from "@/utils/dateFormatter";

defineProps({
  vehicle: {
    type: Object,
    required: true
  }
});
</script>