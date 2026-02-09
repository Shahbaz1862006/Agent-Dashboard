<template>
  <span
    :class="cn(
      BADGE_BASE_CLASS,
      variantClasses[variant],
      $attrs.class
    )"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { cn } from "../../utils/cn";
import { BADGE_BASE_CLASS } from "../../utils/badgeSystem";

type TagVariant = "default" | "info";

withDefaults(
  defineProps<{ variant?: TagVariant }>(),
  { variant: "default" }
);

const variantClasses: Record<TagVariant, string> = {
  default: "bg-muted/60 text-muted-foreground border-border",
  info: "bg-primary/10 text-foreground border-primary/20",
};
</script>
