<template>
  <tr
    :class="cn(
      'border-b border-border/60 last:border-0',
      TABLE_ROW_HOVER,
      TABLE_ROW_TRANSITION,
      $attrs.class
    )"
    v-bind="$attrs"
  >
    <slot />
  </tr>
</template>

<script setup lang="ts">
import { cn } from "../../utils/cn";
import { TABLE_ROW_HOVER, TABLE_ROW_TRANSITION } from "../../constants/tableDesign";
</script>
