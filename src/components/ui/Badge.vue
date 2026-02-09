<template>
  <span
    :class="cn(
      BADGE_BASE_CLASS,
      toneClasses[tone],
      $attrs.class
    )"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { cn } from "../../utils/cn";
import { BADGE_BASE_CLASS } from "../../utils/badgeSystem";

type Tone = "default" | "success" | "warning" | "danger" | "info";

withDefaults(
  defineProps<{ tone?: Tone }>(),
  { tone: "default" }
);

const toneClasses: Record<Tone, string> = {
  default: "bg-muted text-muted-foreground border-border",
  success: "bg-primary/15 text-primary border-primary/25",
  warning: "bg-warning/15 border-warning/25 text-amber-700 dark:text-amber-300",
  danger: "bg-destructive/15 border-destructive/25 text-destructive",
  info: "bg-sky-500/15 border-sky-500/25 text-sky-700 dark:text-sky-300",
};
</script>
