<template>
  <input
    :type="type"
    :value="modelValue"
    :class="cn(
      'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      $attrs.class
    )"
    v-bind="$attrs"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<script setup lang="ts">
import { cn } from "../../utils/cn";

withDefaults(defineProps<{ type?: string; modelValue?: string | number }>(), { modelValue: "" });
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
</script>
