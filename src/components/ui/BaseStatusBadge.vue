<template>
  <Badge :tone="variant">
    <slot>{{ displayLabel }}</slot>
  </Badge>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Badge from "./Badge.vue";
import { getStatusVariant, getStatusLabel, type BadgeVariant } from "../../utils/badgeSystem";

const props = defineProps<{
  /** Raw status from API or UI (e.g. PENDING, Completed, Tier A) */
  status: string;
  /** Override display label; default from getStatusLabel(status) */
  label?: string;
  /** Override variant; default from getStatusVariant(status) */
  variant?: BadgeVariant;
}>();

const variant = computed<BadgeVariant>(() => props.variant ?? getStatusVariant(props.status));
const displayLabel = computed(() => props.label ?? getStatusLabel(props.status));
</script>
