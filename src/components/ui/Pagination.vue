<template>
  <div class="flex items-center justify-between gap-3">
    <div class="text-xs text-muted-foreground">
      Page <span class="text-foreground">{{ page }}</span> of <span class="text-foreground">{{ pages }}</span>
    </div>
    <div class="flex items-center gap-2">
      <Button size="sm" variant="secondary" :disabled="prevDisabled" @click="onPageChange(page - 1)">
        Prev
      </Button>
      <Button size="sm" variant="secondary" :disabled="nextDisabled" @click="onPageChange(page + 1)">
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
  onPageChange: (p: number) => void;
}>();

const pages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));
const prevDisabled = computed(() => props.page <= 1);
const nextDisabled = computed(() => props.page >= pages.value);
</script>
