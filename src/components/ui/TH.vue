<template>
  <th
    :class="cn(
      TABLE_CELL_PADDING,
      TABLE_HEADER_TEXT,
      TABLE_CELL_ALIGN,
      $attrs.class
    )"
    v-bind="$attrs"
  >
    <slot />
  </th>
</template>

<script setup lang="ts">
import { cn } from "../../utils/cn";
import { TABLE_CELL_PADDING, TABLE_HEADER_TEXT, TABLE_CELL_ALIGN } from "../../constants/tableDesign";
</script>
