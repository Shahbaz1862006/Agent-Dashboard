<template>
  <div class="space-y-8">
    <!-- Page header -->
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-muted-foreground">Welcome back.</p>
        <h1 class="text-xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p class="mt-1 text-sm text-muted-foreground">Your real-time business overview.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <TimeRangeControl v-model="range" />
        <Button size="sm" variant="secondary" @click="nav('/dashboard/invites')">Invite Player</Button>
        <Button size="sm" variant="secondary" class="home-btn-primary" @click="nav('/dashboard/wallet')">Deposit USDT</Button>
      </div>
    </header>

    <!-- Row 1 — High-level health (3 equal cards) -->
    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card class="flex flex-col">
        <CardHeader class="pb-2">
          <CardTitle class="text-base">Wallet Health</CardTitle>
        </CardHeader>
        <CardContent class="flex-1 flex flex-col min-h-0">
          <template v-if="walletLoading">
            <div class="space-y-2">
              <Skeleton class="h-8 w-32" />
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-4/5" />
            </div>
          </template>
          <template v-else-if="walletError">
            <p class="text-sm text-destructive">Failed to load wallet.</p>
            <Button size="sm" variant="secondary" class="mt-2" @click="walletQ.run?.()">Retry</Button>
          </template>
          <template v-else-if="walletData">
            <div class="space-y-3">
              <div class="flex items-baseline justify-between gap-2">
                <span class="text-2xl font-semibold text-foreground">{{ fmtUSDT(walletData.total) }}</span>
                <BaseStatusBadge :status="walletData.available < 2000 ? 'Low balance' : 'Healthy'" />
              </div>
              <div class="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div><span class="block">Available</span><span class="font-medium text-foreground">{{ fmtUSDT(walletData.available) }}</span></div>
                <div><span class="block">Locked</span><span class="font-medium text-foreground">{{ fmtUSDT(walletData.locked) }}</span></div>
                <div><span class="block">Network</span><span class="font-medium text-foreground">TRC-20</span></div>
              </div>
              <p v-if="walletData.available < 2000" class="text-xs text-amber-700 dark:text-amber-300">Low balance may block conversions.</p>
              <div class="flex gap-2 pt-1">
                <Button size="sm" variant="secondary" @click="nav('/dashboard/wallet')">View wallet</Button>
                <Button size="sm" variant="primary" class="home-btn-primary" @click="nav('/dashboard/wallet')">Add funds</Button>
              </div>
            </div>
          </template>
          <template v-else>
            <p class="text-sm text-muted-foreground">No wallet data.</p>
          </template>
        </CardContent>
      </Card>

      <Card class="flex flex-col">
        <CardHeader class="pb-2">
          <CardTitle class="text-base">Revenue Tracker</CardTitle>
        </CardHeader>
        <CardContent class="flex-1 flex flex-col min-h-0">
          <template v-if="statementsLoading">
            <div class="space-y-2">
              <Skeleton class="h-8 w-36" />
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-3/4" />
            </div>
          </template>
          <template v-else-if="statementsError">
            <p class="text-sm text-destructive">Failed to load commissions.</p>
            <Button size="sm" variant="secondary" class="mt-2" @click="statementsQ.run?.()">Retry</Button>
          </template>
          <template v-else-if="firstStatement">
            <div class="space-y-3">
              <div class="flex items-baseline justify-between gap-2">
                <span class="text-2xl font-semibold text-foreground">{{ fmtUSDT(firstStatement.finalPayout) }}</span>
                <BaseStatusBadge :status="firstStatement.status" />
              </div>
              <div class="space-y-0.5 text-xs text-muted-foreground">
                <p>Cycle earned: <span class="font-medium text-foreground">{{ fmtUSDT(firstStatement.finalPayout) }}</span></p>
                <p>Projected: <span class="font-medium text-foreground">{{ fmtUSDT(revenueProjected) }}</span> · Tier 2 · {{ (firstStatement.commissionRate * 100).toFixed(1) }}%</p>
              </div>
              <Button size="sm" variant="secondary" @click="nav('/dashboard/commissions')">View statements</Button>
            </div>
          </template>
          <template v-else>
            <p class="text-sm text-muted-foreground">No statement data.</p>
          </template>
        </CardContent>
      </Card>

      <Card class="flex flex-col md:col-span-2 lg:col-span-1">
        <CardHeader class="pb-2">
          <CardTitle class="text-base">Clan Snapshot</CardTitle>
        </CardHeader>
        <CardContent class="flex-1 flex flex-col min-h-0">
          <template v-if="goalsLoading">
            <div class="space-y-2">
              <Skeleton class="h-5 w-full" />
              <Skeleton class="h-4 w-5/6" />
              <Skeleton class="h-4 w-4/6" />
            </div>
          </template>
          <template v-else-if="goalsError">
            <p class="text-sm text-destructive">Failed to load goals.</p>
            <Button size="sm" variant="secondary" class="mt-2" @click="goalsQ.run?.()">Retry</Button>
          </template>
          <template v-else>
            <div class="space-y-3">
              <div class="text-xs text-muted-foreground">Active players: <span class="font-medium text-foreground">12</span></div>
              <div class="text-xs text-muted-foreground">Weekly progress: <span class="font-medium text-foreground">{{ goalsList[0]?.progress ?? 0 }}%</span> — {{ goalsList[0]?.title ?? "—" }}</div>
              <div class="text-xs text-muted-foreground">Top contributors: <span class="font-medium text-foreground">Ali, Hassan, Zara</span></div>
              <div class="text-xs text-muted-foreground">Rewards unlocked: <span class="font-medium text-foreground">2</span></div>
              <Button size="sm" variant="secondary" @click="nav('/dashboard/clan')">View clan hub</Button>
            </div>
          </template>
        </CardContent>
      </Card>
    </section>

    <!-- Row 2 — Trends & flow (50 / 50) -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card class="flex flex-col">
        <CardHeader class="pb-2">
          <div class="flex items-center justify-between">
            <CardTitle class="text-base">Deposits vs Withdrawals</CardTitle>
            <Button size="sm" variant="ghost" @click="nav('/dashboard/wallet')">Open</Button>
          </div>
        </CardHeader>
        <CardContent class="min-h-[240px] flex flex-col">
          <template v-if="analyticsStore.loading">
            <div class="flex-1 flex items-center justify-center py-8">
              <div class="space-y-2 w-full max-w-[280px]">
                <Skeleton class="h-4 w-full" />
                <Skeleton class="h-32 w-full" />
                <Skeleton class="h-4 w-4/5" />
              </div>
            </div>
          </template>
          <template v-else-if="analyticsStore.error">
            <div class="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <p class="text-sm text-destructive">{{ analyticsStore.error }}</p>
              <Button size="sm" variant="secondary" class="mt-3" @click="fetchCharts">Retry</Button>
            </div>
          </template>
          <template v-else-if="chartDataDep && depSeries.length">
            <div class="flex-1 min-h-0 w-full">
              <Line :key="'dep-' + range" :data="chartDataDep" :options="chartOptions" />
            </div>
          </template>
          <template v-else>
            <div class="flex-1 flex items-center justify-center py-8 text-sm text-muted-foreground">No data</div>
          </template>
        </CardContent>
      </Card>

      <Card class="flex flex-col">
        <CardHeader class="pb-2">
          <div class="flex items-center justify-between">
            <CardTitle class="text-base">GGR Trends</CardTitle>
            <Button size="sm" variant="ghost" @click="nav('/dashboard/commissions')">Open</Button>
          </div>
        </CardHeader>
        <CardContent class="min-h-[240px] flex flex-col">
          <template v-if="analyticsStore.loading">
            <div class="flex-1 flex items-center justify-center py-8">
              <div class="space-y-2 w-full max-w-[280px]">
                <Skeleton class="h-4 w-full" />
                <Skeleton class="h-32 w-full" />
                <Skeleton class="h-4 w-4/5" />
              </div>
            </div>
          </template>
          <template v-else-if="analyticsStore.error">
            <div class="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <p class="text-sm text-destructive">{{ analyticsStore.error }}</p>
              <Button size="sm" variant="secondary" class="mt-3" @click="fetchCharts">Retry</Button>
            </div>
          </template>
          <template v-else-if="chartDataGgr && ggrSeries.length">
            <div class="flex-1 min-h-0 w-full">
              <Line :key="'ggr-' + range" :data="chartDataGgr" :options="chartOptionsArea" />
            </div>
          </template>
          <template v-else>
            <div class="flex-1 flex items-center justify-center py-8 text-sm text-muted-foreground">No data</div>
          </template>
        </CardContent>
      </Card>
    </section>

    <!-- Row 3 — Operations snapshot (50 / 50) -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card class="flex flex-col">
        <CardHeader class="pb-2">
          <div class="flex items-center justify-between">
            <CardTitle class="text-base">Deposits Summary</CardTitle>
            <Button size="sm" variant="ghost" @click="nav('/dashboard/players')">View all</Button>
          </div>
        </CardHeader>
        <CardContent class="flex-1 min-h-0">
          <template v-if="depositsSummaryLoading">
            <div class="space-y-2">
              <Skeleton v-for="n in 5" :key="n" class="h-10 w-full rounded-lg" />
            </div>
          </template>
          <template v-else-if="depositsSummaryError">
            <p class="text-sm text-destructive">Failed to load deposits.</p>
            <Button size="sm" variant="secondary" class="mt-2" @click="depositsSummaryQ.run?.()">Retry</Button>
          </template>
          <template v-else-if="depositsSummaryList.length === 0">
            <p class="text-sm text-muted-foreground">No player deposits yet.</p>
            <Button size="sm" variant="secondary" class="mt-2" @click="nav('/dashboard/players')">View players</Button>
          </template>
          <template v-else>
            <div class="space-y-0">
              <div class="grid grid-cols-4 gap-2 px-0 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                <span>Player</span>
                <span>Fiat→USDT</span>
                <span>Status</span>
                <span>Time</span>
              </div>
              <div
                v-for="d in depositsSummaryList"
                :key="d.id"
                class="grid grid-cols-4 gap-2 py-2.5 text-xs border-b border-border/60 last:border-0 cursor-pointer transition-colors hover:bg-muted/30"
                :class="{ 'bg-destructive/5': d.status === 'Failed' }"
                @click="nav('/dashboard/players/' + d.playerId)"
              >
                <span class="font-medium text-foreground truncate">{{ d.playerName }}</span>
                <span class="text-foreground">{{ d.fiatAmount }} → {{ fmtUSDT(d.usdtAmount) }}</span>
                <span><BaseStatusBadge :status="d.status" /></span>
                <span class="text-muted-foreground">{{ fmtTime(d.at) }}</span>
              </div>
            </div>
          </template>
        </CardContent>
      </Card>

      <Card class="flex flex-col">
        <CardHeader class="pb-2">
          <div class="flex items-center justify-between">
            <CardTitle class="text-base">Recent Payouts</CardTitle>
            <Button size="sm" variant="ghost" @click="nav('/dashboard/payouts')">View all</Button>
          </div>
        </CardHeader>
        <CardContent class="flex-1 min-h-0">
          <template v-if="payoutsLoading">
            <div class="space-y-2">
              <Skeleton v-for="n in 5" :key="n" class="h-10 w-full rounded-lg" />
            </div>
          </template>
          <template v-else-if="payoutsError">
            <p class="text-sm text-destructive">Failed to load payouts.</p>
            <Button size="sm" variant="secondary" class="mt-2" @click="payoutsQ.run?.()">Retry</Button>
          </template>
          <template v-else-if="payoutsList.length === 0">
            <p class="text-sm text-muted-foreground">No payouts yet.</p>
            <Button size="sm" variant="secondary" class="mt-2" @click="nav('/dashboard/payouts')">View payouts</Button>
          </template>
          <template v-else>
            <div class="space-y-0">
              <div class="grid grid-cols-4 gap-2 px-0 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                <span>Player</span>
                <span>Method</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              <div
                v-for="p in payoutsList"
                :key="p.id"
                class="grid grid-cols-4 gap-2 py-2.5 text-xs border-b border-border/60 last:border-0 cursor-pointer transition-colors hover:bg-muted/30"
                :class="{ 'bg-destructive/5': p.status === 'Declined' }"
                @click="nav('/dashboard/payouts')"
              >
                <span class="font-medium text-foreground truncate">{{ p.playerName }}</span>
                <span class="text-muted-foreground">{{ p.method }}</span>
                <span class="font-medium text-foreground">{{ fmtUSDT(p.amount) }}</span>
                <span v-if="p.status"><BaseStatusBadge :status="p.status" /></span>
                <span v-else class="text-muted-foreground text-xs">Awaiting</span>
              </div>
            </div>
          </template>
        </CardContent>
      </Card>
    </section>

    <!-- Row 4 — Attention & goals (50 / 50) -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card class="flex flex-col">
        <CardHeader class="pb-2">
          <div class="flex items-center justify-between">
            <CardTitle class="text-base">Alerts</CardTitle>
            <Button v-if="alertsList.length > 4" size="sm" variant="ghost" class="text-muted-foreground" @click="nav('/dashboard/wallet')">View all</Button>
          </div>
        </CardHeader>
        <CardContent class="flex-1 min-h-0">
          <template v-if="alertsLoading">
            <div class="space-y-2">
              <Skeleton v-for="n in 3" :key="n" class="h-12 w-full rounded-lg" />
            </div>
          </template>
          <template v-else-if="alertsError">
            <p class="text-sm text-destructive">Failed to load alerts.</p>
            <Button size="sm" variant="secondary" class="mt-2" @click="alertsQ.run?.()">Retry</Button>
          </template>
          <template v-else-if="alertsList.length === 0">
            <p class="text-sm text-muted-foreground">No active alerts.</p>
          </template>
          <template v-else>
            <div class="space-y-2">
              <div
                v-for="a in alertsDisplayList"
                :key="a.id"
                class="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/60 px-3 py-2.5 transition-colors hover:bg-muted/20"
              >
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-foreground truncate">{{ a.title }}</p>
                  <p class="text-xs text-muted-foreground mt-0.5 truncate">{{ a.description }}</p>
                </div>
                <div class="w-[7rem] shrink-0 flex items-center justify-end">
                  <Button size="sm" variant="secondary" class="min-h-8 px-3 rounded-md justify-center" @click="nav(a.deepLink)">{{ alertActionLabel(a) }}</Button>
                </div>
              </div>
            </div>
          </template>
        </CardContent>
      </Card>

      <Card class="flex flex-col">
        <CardHeader class="pb-2">
          <div class="flex items-center justify-between">
            <CardTitle class="text-base">Clan Goals</CardTitle>
            <Button size="sm" variant="ghost" @click="nav('/dashboard/clan/goals')">View all</Button>
          </div>
        </CardHeader>
        <CardContent class="flex-1 min-h-0">
          <template v-if="goalsLoading">
            <div class="space-y-3">
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-2 w-full rounded-full" />
              <Skeleton class="h-4 w-4/5" />
              <Skeleton class="h-2 w-full rounded-full" />
            </div>
          </template>
          <template v-else-if="goalsError">
            <p class="text-sm text-destructive">Failed to load goals.</p>
            <Button size="sm" variant="secondary" class="mt-2" @click="goalsQ.run?.()">Retry</Button>
          </template>
          <template v-else-if="goalsList.length === 0">
            <p class="text-sm text-muted-foreground">No goals this cycle.</p>
            <Button size="sm" variant="secondary" class="mt-2" @click="nav('/dashboard/clan/goals')">View clan goals</Button>
          </template>
          <template v-else>
            <div class="space-y-4">
              <div class="w-full space-y-4">
                <div v-for="g in goalsList" :key="g.id">
                  <div class="flex items-center justify-between text-sm">
                    <span class="font-medium text-foreground">{{ g.title }}</span>
                    <span class="text-muted-foreground tabular-nums">{{ g.progress }}%</span>
                  </div>
                  <div class="mt-1.5 h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div class="h-full rounded-full bg-primary/70 transition-[width]" :style="{ width: g.progress + '%' }" />
                  </div>
                  <p class="mt-1 text-xs text-muted-foreground">{{ g.remainingLabel }}</p>
                </div>
              </div>
              <div class="w-full">
                <Button size="sm" variant="secondary" class="w-full min-h-9 rounded-md justify-center items-center" @click="nav('/dashboard/clan/goals')">View Clan Hub</Button>
              </div>
            </div>
          </template>
        </CardContent>
      </Card>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import Card from "../../components/ui/Card.vue";
import CardHeader from "../../components/ui/CardHeader.vue";
import CardTitle from "../../components/ui/CardTitle.vue";
import CardContent from "../../components/ui/CardContent.vue";
import Button from "../../components/ui/Button.vue";
import BaseStatusBadge from "../../components/ui/BaseStatusBadge.vue";
import Skeleton from "../../components/ui/Skeleton.vue";
import TimeRangeControl from "../../components/charts/TimeRangeControl.vue";
import type { Alert } from "../../types";
import { useAsync } from "../../composables/useAsync";
import { api } from "../../services/client";
import { fmtUSDT } from "../../utils/format";
import { useHomepageAnalyticsStore } from "../../stores/homepageAnalytics";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

type TimeRange = "24H" | "7D" | "30D" | "90D" | "YTD";

function rangeToDays(r: TimeRange): number {
  return r === "24H" ? 7 : r === "7D" ? 7 : r === "30D" ? 30 : r === "90D" ? 90 : 90;
}

const router = useRouter();
const range = ref<TimeRange>("7D");
const analyticsStore = useHomepageAnalyticsStore();

const walletQ = useAsync(() => api.getWalletSummary(), []);
const alertsQ = useAsync(() => api.getAlerts(), []);
const payoutsQ = useAsync(() => api.getPayouts(), []);
const goalsQ = useAsync(() => api.getGoals(), []);
const statementsQ = useAsync(() => api.getStatements(), []);
const depositsSummaryQ = useAsync(() => api.getPlayerDepositsSummary(), []);

const walletLoading = walletQ.loading;
const walletError = walletQ.error;
const statementsLoading = statementsQ.loading;
const statementsError = statementsQ.error;
const alertsLoading = alertsQ.loading;
const alertsError = alertsQ.error;
const payoutsLoading = payoutsQ.loading;
const payoutsError = payoutsQ.error;
const goalsLoading = goalsQ.loading;
const goalsError = goalsQ.error;
const depositsSummaryLoading = depositsSummaryQ.loading;
const depositsSummaryError = depositsSummaryQ.error;

const walletData = computed(() => walletQ.data?.value ?? null);
const firstStatement = computed(() => {
  const d = statementsQ.data?.value;
  return Array.isArray(d) && d.length > 0 ? d[0] : null;
});
const revenueProjected = computed(() => {
  const s = firstStatement.value;
  return s ? Math.round(s.finalPayout * 1.08 * 100) / 100 : 0;
});
const alertsList = computed(() => {
  const d = alertsQ.data?.value;
  return Array.isArray(d) ? d : [];
});
const severityOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
const alertsSortedBySeverity = computed(() => {
  const list = [...alertsList.value];
  return list.sort((a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3));
});
const alertsDisplayList = computed(() => alertsSortedBySeverity.value.slice(0, 4));
const payoutsList = computed(() => {
  const d = payoutsQ.data?.value;
  return Array.isArray(d) ? d.slice(0, 5) : [];
});
const goalsList = computed(() => {
  const d = goalsQ.data?.value;
  return Array.isArray(d) ? d.slice(0, 3) : [];
});
const depositsSummaryList = computed(() => {
  const d = depositsSummaryQ.data?.value;
  return Array.isArray(d) ? d.slice(0, 5) : [];
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: true } },
  scales: {
    x: { grid: { display: false }, ticks: { color: "rgba(148,163,184,0.45)", maxRotation: 45 } },
    y: { grid: { display: false }, ticks: { color: "rgba(148,163,184,0.45)" } },
  },
};

const chartOptionsArea = {
  ...chartOptions,
  elements: { line: { fill: true }, point: { radius: 0 } },
};

const depSeries = computed(() => analyticsStore.depositsWithdrawalsSeries);
const ggrSeries = computed(() => analyticsStore.ggrSeries);

const chartDataDep = computed(() => {
  const s = depSeries.value;
  if (!s.length) return null;
  return {
    labels: s.map((p) => p.date.slice(5)),
    datasets: [
      { label: "Deposits", data: s.map((p) => p.deposits), borderColor: "hsl(var(--primary))", tension: 0.3, fill: false },
      { label: "Withdrawals", data: s.map((p) => p.withdrawals), borderColor: "hsl(var(--muted-foreground))", tension: 0.3, fill: false },
    ],
  };
});

const chartDataGgr = computed(() => {
  const s = ggrSeries.value;
  if (!s.length) return null;
  return {
    labels: s.map((p) => p.date.slice(5)),
    datasets: [
      { label: "GGR", data: s.map((p) => p.ggr), borderColor: "hsl(var(--primary))", backgroundColor: "hsla(var(--primary), 0.15)", tension: 0.3, fill: true },
    ],
  };
});

function fetchCharts() {
  analyticsStore.fetchHomepageCharts(rangeToDays(range.value));
}

onMounted(() => {
  fetchCharts();
});

watch(range, () => {
  fetchCharts();
});

function nav(path: string) {
  router.push(path);
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffH < 24) return diffH + "h ago";
  if (diffD < 7) return diffD + "d ago";
  return d.toLocaleDateString();
}

function alertActionLabel(a: Alert) {
  if (a.deepLink.includes("/wallet")) return "Deposit USDT";
  if (a.deepLink.includes("/payouts")) return "Retry payout";
  if (a.deepLink.includes("/invites")) return "Resend invite";
  if (a.deepLink.includes("/players")) return "View player";
  return "View";
}
</script>

<style scoped>
/* Homepage-only button hierarchy. Do not reuse outside HomePage. */
.home-btn-primary {
  background-color: #1abc55 !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: none;
}
.home-btn-primary:hover {
  background-color: rgba(26, 188, 85, 0.88) !important;
  color: #ffffff !important;
}
.home-btn-primary:active {
  background-color: rgba(26, 188, 85, 0.78) !important;
  color: #ffffff !important;
}
.home-btn-primary:disabled {
  opacity: 0.5;
}
</style>
