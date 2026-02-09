<template>
  <Icon :icon="`lucide:${name}`" :class="className" />
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";

defineProps<{ name: string; className?: string }>();
</script>
