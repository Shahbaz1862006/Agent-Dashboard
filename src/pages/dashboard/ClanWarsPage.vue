<template>
  <div class="space-y-8">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-semibold tracking-tight text-foreground">Clan Wars</h1>
        <p class="mt-1 text-sm text-muted-foreground">Upcoming, active, and past wars.</p>
      </div>
    </header>

    <BaseTableWrapper title="Wars">
      <template v-if="loading">
        <div class="space-y-2 py-4">
          <Skeleton v-for="n in 4" :key="n" class="h-14 w-full rounded-xl" />
        </div>
      </template>
      <template v-else-if="error">
        <div class="py-8 text-center">
          <p class="text-sm text-destructive">Failed to load wars.</p>
          <Button variant="secondary" class="mt-3" @click="q.run?.()">Retry</Button>
        </div>
      </template>
      <template v-else-if="warsList.length === 0">
        <EmptyState title="No wars yet" message="Wars will appear here when scheduled." />
      </template>
      <template v-else>
        <div class="space-y-2 pb-4">
          <div
            v-for="w in warsList"
            :key="w.id"
            class="rounded-xl border border-border/60 bg-card/60 px-4 py-3 flex items-center justify-between gap-4 transition-colors hover:bg-muted/20"
          >
            <div class="min-w-0 flex-1">
              <div class="text-sm font-semibold text-foreground">{{ w.name }}</div>
              <div class="text-xs text-muted-foreground truncate">{{ w.status }} • {{ w.opponent }}</div>
            </div>
            <BaseStatusBadge :status="w.status" />
            <Button size="sm" variant="ghost" class="shrink-0" @click="router.push(`/dashboard/clan/wars/${w.id}`)">View</Button>
          </div>
        </div>
      </template>
    </BaseTableWrapper>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import BaseTableWrapper from "../../components/ui/BaseTableWrapper.vue";
import Button from "../../components/ui/Button.vue";
import BaseStatusBadge from "../../components/ui/BaseStatusBadge.vue";
import EmptyState from "../../components/ui/EmptyState.vue";
import Skeleton from "../../components/ui/Skeleton.vue";
import { useAsync } from "../../composables/useAsync";
import { api } from "../../services/client";

const router = useRouter();
const q = useAsync(() => api.getWars(), []);
const loading = q.loading;
const error = q.error;
const warsList = computed(() => {
  const d = q.data?.value;
  return Array.isArray(d) ? d : [];
});
</script>
