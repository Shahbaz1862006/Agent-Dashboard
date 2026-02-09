<template>
  <thead :class="cn(TABLE_HEADER_STICKY, TABLE_HEADER_TEXT, $attrs.class)" v-bind="$attrs">
    <slot />
  </thead>
</template>

<script setup lang="ts">
import { cn } from "../../utils/cn";
import { TABLE_HEADER_STICKY, TABLE_HEADER_TEXT } from "../../constants/tableDesign";
</script>
