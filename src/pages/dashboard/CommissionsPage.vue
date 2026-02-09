<template>
  <div class="space-y-8">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-semibold tracking-tight text-foreground">Commissions</h1>
        <p class="mt-1 text-sm text-muted-foreground">Statements, tiers, adjustments, and ledger references.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <TimeRangeControl v-model="range" />
        <Button size="sm" variant="secondary" @click="router.push('/dashboard/wallet')">View wallet ledger</Button>
      </div>
    </header>

    <BaseTableWrapper title="Weekly Statements">
      <template v-if="loading">
        <div class="space-y-2 py-4">
          <Skeleton v-for="n in 4" :key="n" class="h-14 w-full rounded-xl" />
        </div>
      </template>
      <template v-else-if="error">
        <div class="py-8 text-center">
          <p class="text-sm text-destructive">Failed to load statements.</p>
          <Button variant="secondary" class="mt-3" @click="q.run?.()">Retry</Button>
        </div>
      </template>
      <template v-else-if="statementsList.length === 0">
        <EmptyState title="No statements yet" message="Weekly statements will appear here." />
      </template>
      <template v-else>
        <div class="space-y-2 pb-4">
          <div
            v-for="s in statementsList"
            :key="s.id"
            class="rounded-xl border border-border/60 bg-card/60 px-4 py-3 flex items-center justify-between gap-4 transition-colors hover:bg-muted/20"
          >
            <div class="min-w-0 flex-1">
              <div class="text-sm font-semibold text-foreground">{{ s.weekLabel }}</div>
              <div class="mt-0.5 text-xs text-muted-foreground truncate">Ledger ref: {{ s.ledgerRefId }}</div>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <div class="text-sm font-semibold tabular-nums">{{ fmtUSDT(s.finalPayout) }}</div>
              <BaseStatusBadge :status="s.status" />
              <Button size="sm" variant="ghost" @click="router.push(`/dashboard/commissions/statements/${s.id}`)">View</Button>
            </div>
          </div>
        </div>
      </template>
    </BaseTableWrapper>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import BaseTableWrapper from "../../components/ui/BaseTableWrapper.vue";
import Button from "../../components/ui/Button.vue";
import BaseStatusBadge from "../../components/ui/BaseStatusBadge.vue";
import EmptyState from "../../components/ui/EmptyState.vue";
import Skeleton from "../../components/ui/Skeleton.vue";
import TimeRangeControl from "../../components/charts/TimeRangeControl.vue";
import { useAsync } from "../../composables/useAsync";
import { api } from "../../services/client";
import { fmtUSDT } from "../../utils/format";

const router = useRouter();
const q = useAsync(() => api.getStatements(), []);
const loading = q.loading;
const error = q.error;
const statementsList = computed(() => {
  const d = q.data?.value;
  return Array.isArray(d) ? d : [];
});
const range = ref<"24H" | "7D" | "30D" | "90D" | "YTD">("30D");
</script>
