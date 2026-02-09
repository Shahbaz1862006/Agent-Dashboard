<template>
  <div class="relative inline-block" ref="rootRef">
    <Button
      type="button"
      size="icon"
      variant="ghost"
      class="h-8 w-8"
      :aria-label="ariaLabel"
      :aria-expanded="open"
      @click.stop="open = !open"
    >
      <IconLucide name="more-vertical" class="h-4 w-4" />
    </Button>
    <Teleport to="body">
      <div
        v-if="open"
        class="fixed z-50 min-w-[160px] rounded-lg border border-border bg-card py-1 shadow-lg"
        :style="menuStyle"
        ref="menuRef"
        @click="open = false"
      >
        <slot />
      </div>
    </Teleport>
    <div v-if="open" class="fixed inset-0 z-40" aria-hidden="true" @click="open = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import Button from "./Button.vue";
import IconLucide from "../common/IconLucide.vue";

defineProps<{
  ariaLabel?: string;
}>();

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const menuStyle = ref({ top: "0", left: "0" });

function positionMenu() {
  const root = rootRef.value;
  const menu = menuRef.value;
  if (!root || !menu) return;
  const rect = root.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const padding = 4;
  let top = rect.bottom + padding;
  let left = rect.left;
  if (top + menuRect.height > window.innerHeight) {
    top = rect.top - menuRect.height - padding;
  }
  if (left + menuRect.width > window.innerWidth) {
    left = window.innerWidth - menuRect.width - padding;
  }
  if (left < padding) left = padding;
  menuStyle.value = { top: `${top}px`, left: `${left}px` };
}

watch(open, (v) => {
  if (v) {
    nextTick(() => {
      requestAnimationFrame(positionMenu);
    });
  }
});

onMounted(() => {
  window.addEventListener("resize", () => { if (open.value) positionMenu(); });
});
onUnmounted(() => {
  window.removeEventListener("resize", positionMenu);
});
</script>
