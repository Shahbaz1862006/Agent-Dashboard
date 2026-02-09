<template>
  <select
    :value="modelValue"
    :class="cn(
      'h-10 w-full rounded-lg bg-background border border-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
      $attrs.class
    )"
    v-bind="$attrs"
    @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <slot />
  </select>
</template>

<script setup lang="ts">
import { cn } from "../../utils/cn";

withDefaults(defineProps<{ modelValue?: string }>(), { modelValue: "" });
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
</script>
