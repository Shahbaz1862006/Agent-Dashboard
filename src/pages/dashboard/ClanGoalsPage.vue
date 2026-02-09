<template>
  <div class="space-y-8">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-semibold tracking-tight text-foreground">Clan Goals</h1>
        <p class="mt-1 text-sm text-muted-foreground">Weekly objectives with contributor visibility and reward states.</p>
      </div>
      <Button size="sm" variant="secondary" @click="cofundOpen = true">Co-fund bonus pool</Button>
    </header>

    <BaseTableWrapper title="Weekly Goals">
      <template v-if="loading">
        <div class="space-y-4 py-4">
          <Skeleton v-for="n in 3" :key="n" class="h-32 w-full rounded-xl" />
        </div>
      </template>
      <template v-else-if="error">
        <div class="py-8 text-center">
          <p class="text-sm text-destructive">Failed to load goals.</p>
          <Button variant="secondary" class="mt-3" @click="q.run?.()">Retry</Button>
        </div>
      </template>
      <template v-else-if="goalsList.length === 0">
        <EmptyState title="No goals yet" message="Weekly goals will appear here." />
      </template>
      <template v-else>
        <div class="space-y-4 pb-4">
          <div v-for="g in goalsList" :key="g.id" class="rounded-xl border border-border/60 bg-card/60 p-4 transition-colors hover:bg-muted/10">
            <div class="flex items-center justify-between text-sm">
              <div class="font-semibold text-foreground">{{ g.title }}</div>
              <div class="text-muted-foreground tabular-nums">{{ g.progress }}%</div>
            </div>
            <p class="mt-1 text-sm text-muted-foreground">{{ g.description }}</p>
            <div class="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{{ g.type }}</span>
              <span>•</span>
              <span>{{ g.remainingLabel }}</span>
            </div>
            <div class="mt-3 h-2 rounded-full bg-muted">
              <div class="h-2 rounded-full bg-primary/70 transition-[width]" :style="{ width: g.progress + '%' }" />
            </div>
            <div class="mt-2 text-xs text-muted-foreground">Rewards Locked</div>
          </div>
        </div>
      </template>
    </BaseTableWrapper>

    <Modal :open="cofundOpen" title="Co-fund bonus pool" :on-close="() => (cofundOpen = false)">
      <div class="space-y-4">
        <p class="text-sm text-muted-foreground">
          Optional co-funding is capped. Funds are debited from agent wallet (mock).
        </p>
        <div>
          <div class="text-xs text-muted-foreground">Co-fund cap</div>
          <div class="mt-1 text-lg font-semibold">250 USDT</div>
          <p class="mt-1 text-xs text-muted-foreground">Available wallet balance may reduce the max.</p>
        </div>
        <div>
          <label class="text-xs text-muted-foreground">Amount (USDT)</label>
          <Input v-model.number="cofundAmount" type="number" min="0" max="250" placeholder="0" class="mt-1" />
          <p class="mt-1 text-xs text-muted-foreground">Max allowed now: 250 USDT</p>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" @click="cofundOpen = false">Cancel</Button>
          <Button variant="primary" @click="onCofund">Confirm</Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import BaseTableWrapper from "../../components/ui/BaseTableWrapper.vue";
import Button from "../../components/ui/Button.vue";
import Input from "../../components/ui/Input.vue";
import Modal from "../../components/ui/Modal.vue";
import EmptyState from "../../components/ui/EmptyState.vue";
import Skeleton from "../../components/ui/Skeleton.vue";
import { useAsync } from "../../composables/useAsync";
import { api } from "../../services/client";
import { useToastStore } from "../../stores/toast";

const q = useAsync(() => api.getGoals(), []);
const loading = q.loading;
const error = q.error;
const goalsList = computed(() => {
  const d = q.data?.value;
  return Array.isArray(d) ? d : [];
});
const toast = useToastStore();
const cofundOpen = ref(false);
const cofundAmount = ref<number>(0);

function onCofund() {
  const amt = Number(cofundAmount.value) || 0;
  if (amt <= 0 || amt > 250) {
    toast.push({ title: "Invalid amount", message: "Enter between 1 and 250 USDT.", tone: "warning" });
    return;
  }
  toast.push({ title: "Co-fund submitted", message: `${amt} USDT co-fund (mock).`, tone: "success" });
  cofundOpen.value = false;
  cofundAmount.value = 0;
}
</script>
