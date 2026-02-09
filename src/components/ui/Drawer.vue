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
          'fixed right-0 top-0 z-50 h-full max-w-[92vw] border-l border-border bg-card text-card-foreground shadow-panel',
          open ? 'animate-in slide-in-from-right' : 'animate-out slide-out-to-right',
          widthClass,
        ]"
      >
        <div class="flex h-full flex-col">
          <div class="px-5 pt-5 pb-3 border-b border-border">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-base font-semibold text-foreground">{{ title }}</h2>
                <p v-if="description" class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
              </div>
              <Button variant="ghost" size="sm" type="button" @click="onClose">Close</Button>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto px-5 py-4"><slot /></div>
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
  { widthClass: "w-[520px]" }
);
</script>
