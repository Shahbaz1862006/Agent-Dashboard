<template>
  <thead :class="cn('base-table-header sticky top-0 z-10 bg-card border-b border-border text-xs font-medium text-muted-foreground', $attrs.class)" v-bind="$attrs">
    <slot />
  </thead>
</template>

<script setup lang="ts">
import { cn } from "../../utils/cn";
</script>
