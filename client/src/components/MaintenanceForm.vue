<template>
  <a-modal
    :open="visible"
    :title="formTitle"
    width="600px"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      layout="vertical"
    >
      <a-form-item label="服務項目" name="service">
        <a-input v-model:value="formState.service" placeholder="輸入服務項目" />
      </a-form-item>

      <a-form-item label="服務說明" name="description">
        <a-textarea
          v-model:value="formState.description"
          placeholder="輸入服務詳細說明"
          :rows="3"
        />
      </a-form-item>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="服務日期" name="date">
            <a-date-picker
              v-model:value="formState.date"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="狀態" name="status">
            <a-select v-model:value="formState.status" placeholder="選擇狀態">
              <a-select-option value="pending">待處理</a-select-option>
              <a-select-option value="completed">已完成</a-select-option>
              <a-select-option value="cancelled">已取消</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="技師" name="technician">
            <a-input v-model:value="formState.technician" placeholder="輸入技師姓名" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="費用" name="cost">
            <a-input-number
              v-model:value="formState.cost"
              :min="0"
              style="width: 100%"
              placeholder="輸入費用"
            >
              <template #addonBefore>NT$</template>
            </a-input-number>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="下次保養日期" name="nextDueDate">
            <a-date-picker
              v-model:value="formState.nextDueDate"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="下次保養里程" name="nextDueMileage">
            <a-input-number
              v-model:value="formState.nextDueMileage"
              :min="0"
              style="width: 100%"
              placeholder="輸入里程數"
            >
              <template #addonAfter>公里</template>
            </a-input-number>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import dayjs from "dayjs";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  maintenanceData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(["update:visible", "submit"]);

const formRef = ref();
const formState = reactive({
  service: "",
  description: "",
  date: dayjs().format("YYYY-MM-DD"),
  status: "pending",
  technician: "",
  cost: 0,
  nextDueDate: "",
  nextDueMileage: null
});

const formTitle = computed(() => 
  props.maintenanceData ? "編輯保養記錄" : "新增保養記錄"
);

const rules = {
  service: [{ required: true, message: "請輸入服務項目" }],
  date: [{ required: true, message: "請選擇服務日期" }],
  status: [{ required: true, message: "請選擇狀態" }]
};

watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.maintenanceData) {
      Object.assign(formState, props.maintenanceData);
    } else if (newVal && !props.maintenanceData) {
      resetForm();
    }
  }
);

const resetForm = () => {
  Object.assign(formState, {
    service: "",
    description: "",
    date: dayjs().format("YYYY-MM-DD"),
    status: "pending",
    technician: "",
    cost: 0,
    nextDueDate: "",
    nextDueMileage: null
  });
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    
    const submitData = {
      ...formState,
      id: props.maintenanceData?.id || Date.now().toString()
    };
    
    emit("submit", submitData);
    emit("update:visible", false);
    resetForm();
  } catch (error) {
    console.error("表單驗證失敗:", error);
  }
};

const handleCancel = () => {
  emit("update:visible", false);
  resetForm();
};
</script>