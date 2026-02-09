<template>
  <Button
    type="button"
    variant="ghost"
    :size="size === 'sm' ? 'sm' : 'md'"
    @click="themeStore.toggleTheme()"
    aria-label="Toggle theme"
    :title="themeStore.theme === 'dark' ? 'Switch to light' : 'Switch to dark'"
  >
    <IconLucide :name="themeStore.theme === 'dark' ? 'sun' : 'moon'" class="h-4 w-4" />
  </Button>
</template>

<script setup lang="ts">
import IconLucide from "./IconLucide.vue";
import Button from "../ui/Button.vue";
import { useThemeStore } from "../../stores/theme";

withDefaults(defineProps<{ size?: "sm" | "md" }>(), { size: "sm" });

const themeStore = useThemeStore();
</script>
