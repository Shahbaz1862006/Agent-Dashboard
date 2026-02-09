<template>
  <button
    :class="cn(buttonClass, props.variant === 'secondary' && 'btn-variant-secondary', $attrs.class)"
    :data-variant="props.variant"
    :aria-busy="loading"
    v-bind="restAttrs"
  >
    <span v-if="loading" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0" aria-hidden="true" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { cn } from "../../utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "default" | "icon";

const props = withDefaults(
  defineProps<{ variant?: Variant; size?: Size; loading?: boolean }>(),
  { variant: "secondary", size: "md", loading: false }
);

const attrs = useAttrs();
const restAttrs = computed(() => {
  const { class: _c, ...rest } = attrs as Record<string, unknown> & { class?: string };
  return { ...rest, disabled: (rest.disabled as boolean) || props.loading };
});

// Clarity over decoration: clean shapes, subtle hover, no heavy shadows
const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/95 focus-visible:ring-primary/40",
  secondary:
    "border border-border bg-muted/60 text-foreground hover:bg-muted active:bg-muted/80 focus-visible:ring-border",
  ghost:
    "bg-transparent text-foreground hover:bg-muted/70 active:bg-muted focus-visible:ring-muted-foreground/20",
  danger:
    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/95 focus-visible:ring-destructive/40",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-muted/50 active:bg-muted/70 focus-visible:ring-border",
};

// Comfortable padding; default = md for touch-friendly tap target
const sizeClasses: Record<Size, string> = {
  sm: "h-9 min-h-9 px-3 text-xs",
  md: "h-10 min-h-10 px-4 text-sm",
  default: "h-10 min-h-10 px-4 text-sm",
  icon: "h-10 min-h-10 w-10 p-0",
};

const baseClass =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-[color,background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]";

const buttonClass = computed(() =>
  cn(baseClass, variantClasses[props.variant], sizeClasses[props.size])
);
</script>
