<template>
  <div :class="cn('flex items-center gap-2', $attrs.class)">
    <img
      :src="logoUrl"
      alt="Clazino"
      :class="cn('h-8 w-auto select-none object-contain', compact && 'h-7')"
      draggable="false"
    />
    <span v-if="!compact && !logoOnly" class="text-sm font-semibold tracking-wide">Clazino</span>
  </div>
</template>

<script setup lang="ts">
import { cn } from "../../utils/cn";
import logoUrl from "../../assets/clazino-logo.png";

withDefaults(defineProps<{ compact?: boolean; logoOnly?: boolean }>(), { compact: false, logoOnly: false });
</script>
