<template>
  <div class="space-y-6">
    <template v-if="loading">
      <Card><CardContent class="p-5">Loading statement…</CardContent></Card>
    </template>
    <template v-else-if="error || !statementData">
      <Card>
        <CardContent class="p-5">
          <div class="text-sm text-destructive">Statement not found.</div>
          <Button class="mt-3" variant="secondary" @click="router.push('/dashboard/commissions')">Back</Button>
        </CardContent>
      </Card>
    </template>
    <template v-else-if="statementData">
      <div class="flex items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" @click="router.push('/dashboard/commissions')">Back</Button>
          <h1 class="mt-2 text-lg font-semibold">Statement</h1>
          <p class="mt-1 text-sm text-muted-foreground">{{ statementData.weekLabel }} • {{ statementData.ledgerRefId }}</p>
        </div>
      </div>

      <div class="space-y-6">
        <Card>
          <CardHeader><CardTitle>1. Summary</CardTitle></CardHeader>
          <CardContent class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="text-sm text-muted-foreground">Final commission payout</div>
              <BaseStatusBadge :status="statementData.status" />
            </div>
            <div class="text-2xl font-semibold text-foreground">{{ fmtUSDT(statementData.finalPayout) }}</div>
            <div class="text-sm text-muted-foreground">Ledger ref: {{ statementData.ledgerRefId }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>2. GGR Breakdown</CardTitle></CardHeader>
          <CardContent class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div class="rounded-xl border border-border bg-card/60 p-4">
              <div class="text-xs text-muted-foreground">GGR</div>
              <div class="text-lg font-semibold text-foreground">{{ fmtUSDT(statementData.ggr) }}</div>
            </div>
            <div class="rounded-xl border border-border bg-card/60 p-4">
              <div class="text-xs text-muted-foreground">NGR</div>
              <div class="text-lg font-semibold text-foreground">{{ fmtUSDT(statementData.ngr) }}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>3. Tier Application</CardTitle></CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground mb-2">Commission rate applied for this statement.</p>
            <div class="flex items-center gap-2">
              <BaseTagChip variant="info">Tier 2</BaseTagChip>
              <span class="text-sm font-medium text-foreground">{{ (statementData.commissionRate * 100).toFixed(1) }}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>4. Adjustments</CardTitle></CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground mb-2">Manual/system adjustments</p>
            <div class="text-lg font-semibold" :class="statementData.adjustments >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'">
              {{ statementData.adjustments >= 0 ? "+" : "" }}{{ fmtUSDT(statementData.adjustments) }}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>5. Final Commission</CardTitle></CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground mb-2">Computed using NGR × rate + adjustments.</p>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Final payout</span>
              <span class="text-xl font-semibold text-foreground">{{ fmtUSDT(statementData.finalPayout) }}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>6. Payout Processing</CardTitle></CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground mb-2">Payouts are processed by the system. If status is Pending for too long, escalate via Support.</p>
            <div v-if="statementData.paidAt" class="text-sm font-medium text-foreground">
              Paid at: {{ formatDateTime(statementData.paidAt) }}
            </div>
            <div v-else class="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>7. Wallet Ledger Link</CardTitle></CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground mb-3">Open wallet ledger to find entry by ref ID.</p>
            <Button variant="secondary" @click="router.push('/dashboard/wallet')">Open wallet</Button>
          </CardContent>
        </Card>
      </div>
    </template>
    <template v-else>
      <Card><CardContent class="p-5">No statement data.</CardContent></Card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import Card from "../../components/ui/Card.vue";
import CardHeader from "../../components/ui/CardHeader.vue";
import CardTitle from "../../components/ui/CardTitle.vue";
import CardContent from "../../components/ui/CardContent.vue";
import Button from "../../components/ui/Button.vue";
import BaseStatusBadge from "../../components/ui/BaseStatusBadge.vue";
import BaseTagChip from "../../components/ui/BaseTagChip.vue";
import { useAsync } from "../../composables/useAsync";
import { api } from "../../services/client";
import { fmtUSDT } from "../../utils/format";

const route = useRoute();
const router = useRouter();
const statementId = computed(() => route.params.statementId as string);
const q = useAsync(() => api.getStatement(statementId.value), [statementId]);
const loading = q.loading;
const error = q.error;
const statementData = computed(() => q.data?.value ?? null);

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
</script>
