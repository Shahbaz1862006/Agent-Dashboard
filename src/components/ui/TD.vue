<template>
  <td
    :class="cn(
      TABLE_CELL_PADDING,
      'text-foreground',
      TABLE_CELL_ALIGN,
      $attrs.class
    )"
    v-bind="$attrs"
  >
    <slot />
  </td>
</template>

<script setup lang="ts">
import { cn } from "../../utils/cn";
import { TABLE_CELL_PADDING, TABLE_CELL_ALIGN } from "../../constants/tableDesign";
</script>
