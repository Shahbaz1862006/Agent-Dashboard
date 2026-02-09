<template>
  <div :class="cn('', className)">
    <div class="inline-flex items-center rounded-xl border border-border bg-card/60 p-1">
      <button
        v-for="it in items"
        :key="it.value"
        type="button"
        :disabled="it.disabled"
        :class="cn(
          'px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors rounded-lg',
          modelValue === it.value && 'bg-muted text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )"
        @click="emit('update:modelValue', it.value)"
      >
        {{ it.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from "../../utils/cn";

export type TabItem = { value: string; label: string; disabled?: boolean };

defineProps<{
  modelValue: string;
  items: TabItem[];
  className?: string;
}>();

const emit = defineEmits<{ "update:modelValue": [value: string] }>();
</script>
