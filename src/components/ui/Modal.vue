<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50">
      <div
        class="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
        :class="open ? 'animate-in fade-in-0' : 'animate-out fade-out-0'"
        @click="onClose"
      />
      <div
        :class="[
          'fixed left-1/2 top-1/2 z-50 w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card text-card-foreground shadow-panel',
          open ? 'animate-in zoom-in-95 fade-in-0' : 'animate-out zoom-out-95 fade-out-0',
          widthClass,
        ]"
      >
        <div class="px-5 pt-5 pb-3 border-b border-border">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-base font-semibold text-foreground">{{ title }}</h2>
              <p v-if="description" class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
            </div>
            <Button variant="ghost" size="sm" type="button" @click="onClose">Close</Button>
          </div>
        </div>
        <div class="px-5 py-4"><slot /></div>
        <div class="px-5 pb-5 pt-2 flex items-center justify-end gap-2">
          <slot name="footer">
            <Button type="button" @click="onClose">Done</Button>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import Button from "./Button.vue";

withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    description?: string;
    onClose: () => void;
    widthClass?: string;
  }>(),
  { widthClass: "max-w-lg" }
);
</script>
