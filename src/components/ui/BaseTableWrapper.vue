<template>
  <Card :class="$attrs.class">
    <CardHeader class="pb-3">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-col gap-1">
          <CardTitle v-if="title || $slots.title" class="text-base">
            <slot name="title">{{ title }}</slot>
          </CardTitle>
          <div v-if="$slots.description" class="text-sm">
            <slot name="description" />
          </div>
        </div>
        <div v-if="$slots.tools" class="flex flex-wrap items-center gap-2">
          <slot name="tools" />
        </div>
      </div>
    </CardHeader>
    <CardContent :class="contentClass">
      <slot />
    </CardContent>
    <div v-if="$slots.footer" class="border-t border-border px-5 py-3">
      <slot name="footer" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import Card from "./Card.vue";
import CardHeader from "./CardHeader.vue";
import CardTitle from "./CardTitle.vue";
import CardContent from "./CardContent.vue";
import { TABLE_CONTENT_PADDING } from "../../constants/tableDesign";

defineProps<{
  title?: string;
}>();

/** Fixed padding for ALL tables — do not override. Single design system. */
const contentClass = TABLE_CONTENT_PADDING;
</script>
