<template>
  <table :class="cn('base-table w-full text-sm', $attrs.class)" v-bind="$attrs">
    <slot />
  </table>
</template>

<script setup lang="ts">
import { cn } from "../../utils/cn";
</script>
