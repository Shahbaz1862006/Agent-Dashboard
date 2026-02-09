<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="text-xs text-muted-foreground">
      Showing
      <span class="font-medium text-foreground">{{ start }}-{{ end }}</span>
      of
      <span class="font-medium text-foreground">{{ total }}</span>
    </div>
    <div class="flex items-center gap-2">
      <Button size="sm" variant="secondary" :disabled="page <= 1" @click="onPageChange(page - 1)">
        Previous
      </Button>
      <Button size="sm" variant="secondary" :disabled="page >= totalPages" @click="onPageChange(page + 1)">
        Next
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Button from "./Button.vue";

const props = defineProps<{
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}>();

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));
const start = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1));
const end = computed(() => Math.min(props.page * props.pageSize, props.total));
</script>
