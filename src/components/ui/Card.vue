<template>
  <div :class="cn('rounded-2xl bg-card text-card-foreground shadow-panel border border-border', $attrs.class)">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from "../../utils/cn";
</script>
