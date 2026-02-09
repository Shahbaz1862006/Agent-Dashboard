<template>
  <ActionMenu :aria-label="ariaLabel">
    <slot />
  </ActionMenu>
</template>

<script setup lang="ts">
import ActionMenu from "./ActionMenu.vue";

withDefaults(
  defineProps<{ ariaLabel?: string }>(),
  { ariaLabel: "Row actions" }
);
</script>
