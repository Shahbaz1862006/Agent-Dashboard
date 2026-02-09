<template>
  <div class="py-12 px-4 text-center">
    <p class="text-sm font-medium text-foreground">{{ title }}</p>
    <p v-if="message" class="mt-1 text-sm text-muted-foreground">{{ message }}</p>
    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  message?: string;
}>();
</script>
