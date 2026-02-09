<template>
  <div v-if="open" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/60" @click="onClose" />
    <div :class="cn('absolute inset-0 flex items-center justify-center p-4', className)">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from "../../utils/cn";

defineProps<{
  open: boolean;
  onClose: () => void;
  className?: string;
}>();
</script>
