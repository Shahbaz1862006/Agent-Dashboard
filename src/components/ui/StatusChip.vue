<!-- Deprecated: use BaseStatusBadge. Kept for compatibility. -->
<template>
  <BaseStatusBadge :status="status" :label="label" :variant="variant">
    <slot />
  </BaseStatusBadge>
</template>

<script setup lang="ts">
import BaseStatusBadge from "./BaseStatusBadge.vue";
import type { BadgeVariant } from "../../utils/badgeSystem";

defineProps<{
  status: string;
  label?: string;
  variant?: BadgeVariant;
}>();
</script>
