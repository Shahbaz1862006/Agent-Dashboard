<template>
  <div :class="cn('animate-pulse rounded-lg bg-muted', $attrs.class)" />
</template>

<script setup lang="ts">
import { cn } from "../../utils/cn";
</script>
