<template>
  <div class="space-y-6">
    <template v-if="loading">
      <Card><CardContent class="p-5">Loading player…</CardContent></Card>
    </template>
    <template v-else-if="error || !p">
      <Card>
        <CardContent class="p-5">
          <div class="text-sm text-destructive">Player not found.</div>
          <Button class="mt-3" variant="secondary" @click="router.push('/dashboard/players')">Back</Button>
        </CardContent>
      </Card>
    </template>
    <template v-else-if="p">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" @click="router.push('/dashboard/players')">Back</Button>
          <h1 class="mt-2 text-xl font-semibold">{{ p.name }}</h1>
          <p class="mt-1 text-sm text-muted-foreground">@{{ p.username }} • {{ p.id }}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <BaseStatusBadge :status="p.kycTier" />
            <BaseStatusBadge :status="p.status" />
            <BaseStatusBadge :label="`Risk ${p.riskScore}`" :variant="riskVariant(p.riskScore)" />
          </div>
        </div>
        <Button variant="secondary" @click="reclaimOpen = true">Credit reclaim</Button>
      </div>

      <Tabs v-model="activeTab" :items="tabItems" />

      <Card v-show="activeTab === 'overview'">
        <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="rounded-xl border border-border bg-card/60 p-4">
              <div class="text-xs text-muted-foreground">Available</div>
              <div class="text-xl font-semibold text-foreground">{{ fmtUSDT(p.balanceAvailable) }}</div>
            </div>
            <div class="rounded-xl border border-border bg-card/60 p-4">
              <div class="text-xs text-muted-foreground">Pending</div>
              <div class="text-xl font-semibold text-foreground">{{ fmtUSDT(p.balancePending) }}</div>
            </div>
            <div class="rounded-xl border border-border bg-card/60 p-4">
              <div class="text-xs text-muted-foreground">Locked</div>
              <div class="text-xl font-semibold text-foreground">{{ fmtUSDT(p.balanceLocked) }}</div>
            </div>
          </div>
          <p class="text-xs text-muted-foreground">Automated conversion status.</p>
          <p class="text-xs text-muted-foreground">Locks may be due to war entry or restrictions.</p>
          <div class="rounded-xl border border-border bg-card/60 p-4">
            <div class="text-sm font-semibold text-foreground mb-2">Operational Notes</div>
            <p class="text-sm text-muted-foreground">Credit allocation is automated. Agent cannot manually credit balances. Use reclaim only when eligible.</p>
          </div>
        </CardContent>
      </Card>

      <Card v-show="activeTab === 'transactions'">
        <CardHeader><CardTitle>Transactions</CardTitle></CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground mb-4">Transaction history will be populated via API. For now, use Wallet → Ledger for cross-reference.</p>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="text-xs text-muted-foreground">
                <tr class="border-b border-border">
                  <th class="py-2 text-left font-medium">Date</th>
                  <th class="py-2 text-left font-medium">Type</th>
                  <th class="py-2 text-left font-medium">Amount</th>
                  <th class="py-2 text-left font-medium">Ref</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in playerTransactions" :key="t.id" class="border-b border-border">
                  <td class="py-2 text-muted-foreground">{{ formatDate(t.at) }}</td>
                  <td class="py-2 text-foreground">{{ t.type }}</td>
                  <td class="py-2 text-left font-medium" :class="t.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'">{{ t.amount >= 0 ? "+" : "" }}{{ fmtUSDT(t.amount) }}</td>
                  <td class="py-2 text-muted-foreground font-mono text-xs">{{ t.refId }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card v-show="activeTab === 'activity'">
        <CardHeader><CardTitle>Activity</CardTitle></CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground mb-4">Activity metrics (sessions, streaks, war contributions) will appear here once wired to live events.</p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="rounded-xl border border-border bg-card/60 p-4 text-center">
              <div class="text-2xl font-semibold text-foreground">{{ activity.sessions7d }}</div>
              <div class="text-xs text-muted-foreground">Sessions (7d)</div>
            </div>
            <div class="rounded-xl border border-border bg-card/60 p-4 text-center">
              <div class="text-2xl font-semibold text-foreground">{{ activity.streakDays }}</div>
              <div class="text-xs text-muted-foreground">Current streak</div>
            </div>
            <div class="rounded-xl border border-border bg-card/60 p-4 text-center">
              <div class="text-2xl font-semibold text-foreground">{{ activity.warContrib }}</div>
              <div class="text-xs text-muted-foreground">War contributions</div>
            </div>
            <div class="rounded-xl border border-border bg-card/60 p-4 text-center">
              <div class="text-2xl font-semibold text-foreground">{{ formatDate(p.lastActive) }}</div>
              <div class="text-xs text-muted-foreground">Last active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card v-show="activeTab === 'payouts'">
        <CardHeader><CardTitle>Payouts</CardTitle></CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground mb-4">Payouts are read-only. Open Payouts module for detail views and status timelines.</p>
          <div class="space-y-2">
            <div v-for="po in playerPayouts" :key="po.id" class="rounded-xl border border-border bg-card/60 px-4 py-3 flex items-center justify-between">
              <div>
                <div class="text-sm font-medium text-foreground">{{ po.id }}</div>
                <div class="text-xs text-muted-foreground">{{ po.method }} • {{ fmtUSDT(po.amount) }}</div>
              </div>
              <BaseStatusBadge :status="po.status" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card v-show="activeTab === 'limits'">
        <CardHeader><CardTitle>Responsible Gaming</CardTitle></CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground mb-4">Limits and exclusions override all agent operations. No bypass controls are exposed.</p>
          <div class="rounded-xl border border-border bg-card/60 p-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Daily limit</span>
              <span class="font-medium text-foreground">—</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Weekly limit</span>
              <span class="font-medium text-foreground">—</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Self-exclusion</span>
              <span class="font-medium text-foreground">None</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card v-show="activeTab === 'notes'">
        <CardHeader><CardTitle>Internal note</CardTitle></CardHeader>
        <CardContent class="space-y-3">
          <textarea
            v-model="internalNote"
            class="w-full min-h-[120px] rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Add internal note about this player…"
          />
          <Button variant="primary" @click="saveNote">Save note</Button>
        </CardContent>
      </Card>

      <Card v-show="activeTab === 'audit'">
        <CardHeader><CardTitle>Audit Log</CardTitle></CardHeader>
        <CardContent>
          <div class="space-y-2">
            <div v-for="a in auditLog" :key="a.id" class="rounded-xl border border-border bg-card/60 px-4 py-3 flex items-start justify-between gap-3">
              <div>
                <div class="text-sm font-medium text-foreground">{{ a.action }}</div>
                <div class="text-xs text-muted-foreground">{{ a.detail }}</div>
              </div>
              <div class="text-xs text-muted-foreground shrink-0">{{ formatDateTime(a.at) }}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal :open="reclaimOpen" title="Credit reclaim" :on-close="() => (reclaimOpen = false)">
        <div class="space-y-4">
          <p class="text-sm text-muted-foreground">Reclaim is only available when there is eligible locked balance. This will create a ledger entry (mock).</p>
          <div>
            <div class="text-xs text-muted-foreground">Eligible max</div>
            <div class="text-lg font-semibold text-foreground">{{ fmtUSDT(p.balanceLocked) }}</div>
          </div>
          <div>
            <label class="text-xs text-muted-foreground">Reclaim amount (USDT)</label>
            <Input v-model.number="reclaimAmount" type="number" :min="0" :max="p.balanceLocked" placeholder="0" class="mt-1" />
          </div>
          <div class="flex justify-end gap-2">
            <Button variant="ghost" @click="reclaimOpen = false">Cancel</Button>
            <Button variant="primary" @click="confirmReclaim">Confirm reclaim</Button>
          </div>
        </div>
      </Modal>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import Card from "../../components/ui/Card.vue";
import CardHeader from "../../components/ui/CardHeader.vue";
import CardTitle from "../../components/ui/CardTitle.vue";
import CardContent from "../../components/ui/CardContent.vue";
import Button from "../../components/ui/Button.vue";
import Input from "../../components/ui/Input.vue";
import BaseStatusBadge from "../../components/ui/BaseStatusBadge.vue";
import { getNumericVariant } from "../../utils/badgeSystem";
import Tabs from "../../components/ui/Tabs.vue";
import Modal from "../../components/ui/Modal.vue";
import { useAsync } from "../../composables/useAsync";
import { api } from "../../services/client";
import { useToastStore } from "../../stores/toast";
import { fmtUSDT } from "../../utils/format";
import type { Player } from "../../types";

const route = useRoute();
const router = useRouter();
const toast = useToastStore();
const playerId = computed(() => route.params.playerId as string);
const q = useAsync(() => api.getPlayer(playerId.value), [playerId]);
const loading = q.loading;
const error = q.error;
const p = computed(() => q.data?.value ?? null);

function riskVariant(score: number) {
  return getNumericVariant(score, { danger: 75, warning: 45 });
}

const activeTab = ref("overview");
const tabItems = [
  { value: "overview", label: "Overview" },
  { value: "transactions", label: "Transactions" },
  { value: "activity", label: "Activity" },
  { value: "payouts", label: "Payouts" },
  { value: "limits", label: "Limits" },
  { value: "notes", label: "Notes" },
  { value: "audit", label: "Audit Log" },
];

const internalNote = ref("High-value player. Prefers weekend sessions.");
const reclaimOpen = ref(false);
const reclaimAmount = ref<number>(0);

function hoursAgo(h: number) {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d.toISOString();
}

const playerTransactions = computed(() => {
  if (!p.value) return [];
  return [
    { id: "tx1", at: hoursAgo(2), type: "Deposit", amount: 150, refId: "ref_dep_abc" },
    { id: "tx2", at: hoursAgo(8), type: "Withdrawal", amount: -75, refId: "po_1001" },
    { id: "tx3", at: hoursAgo(24), type: "Deposit", amount: 200, refId: "ref_dep_def" },
    { id: "tx4", at: hoursAgo(48), type: "Commission credit", amount: 12.5, refId: "stmt_02" },
  ];
});

const activity = computed(() => ({
  sessions7d: 12,
  streakDays: 3,
  warContrib: 2,
}));

const playerPayouts = computed(() => {
  const payouts = [
    { id: "po_1001", method: "Crypto" as const, amount: 75, status: "Pending" as const },
    { id: "po_1003", method: "Crypto" as const, amount: 40, status: "Completed" as const },
  ];
  return payouts;
});

const auditLog = computed(() => [
  { id: "a1", action: "Profile opened", detail: "Viewed by agent", at: new Date().toISOString() },
  { id: "a2", action: "Last activity", detail: "Player session recorded", at: p.value?.lastActive ?? "" },
]);

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function saveNote() {
  toast.push({ title: "Note saved", message: "Internal note updated (mock).", tone: "success" });
}

function confirmReclaim() {
  const amt = Number(reclaimAmount.value) || 0;
  if (amt <= 0 || amt > (p.value?.balanceLocked ?? 0)) {
    toast.push({ title: "Invalid amount", message: "Enter a valid reclaim amount.", tone: "warning" });
    return;
  }
  toast.push({ title: "Reclaim queued", message: "Ledger updated (mock).", tone: "success" });
  reclaimOpen.value = false;
  reclaimAmount.value = 0;
}
</script>
