<template>
  <div class="fixed right-4 top-4 z-[60] flex w-[360px] max-w-[90vw] flex-col gap-2">
    <div
      v-for="t in store.items"
      :key="t.id"
      :class="[
        'rounded-xl border border-border bg-card text-card-foreground shadow-panel px-4 py-3',
        t.tone === 'success' && 'border-emerald-500/25',
        t.tone === 'danger' && 'border-rose-500/25',
        t.tone === 'warning' && 'border-amber-500/25',
        t.tone === 'info' && 'border-sky-500/25',
        t.tone === 'default' && 'border-border',
      ]"
    >
      <div class="text-sm font-semibold text-foreground">{{ t.title }}</div>
      <div v-if="t.message" class="mt-0.5 text-sm text-muted-foreground">{{ t.message }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToastStore } from "../../stores/toast";
const store = useToastStore();
</script>
