<template>
  <div :class="className">
    <Select :model-value="modelValue" @update:model-value="emit('update:modelValue', ($event as TimeRange))">
      <option value="24H">24H</option>
      <option value="7D">7D</option>
      <option value="30D">30D</option>
      <option value="90D">90D</option>
      <option value="YTD">YTD</option>
    </Select>
  </div>
</template>

<script setup lang="ts">
import Select from "../ui/Select.vue";

export type TimeRange = "24H" | "7D" | "30D" | "90D" | "YTD";

defineProps<{ modelValue: TimeRange; className?: string }>();
const emit = defineEmits<{ "update:modelValue": [value: TimeRange] }>();
</script>
