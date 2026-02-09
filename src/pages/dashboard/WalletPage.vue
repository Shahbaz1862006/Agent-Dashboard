<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-lg font-semibold">Wallet</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        USDT-only. All player fiat deposits convert automatically to USDT and deduct from your wallet.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card class="lg:col-span-2">
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>Balance</CardTitle>
            <div class="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                class="h-9 min-h-9 min-w-[120px]"
                @click="openWithdrawDialog"
              >
                Withdraw
              </Button>
              <Button
                type="button"
                size="sm"
                class="wallet-btn wallet-btn-deposit h-9 min-h-9 min-w-[120px] px-4 rounded-md text-xs font-medium"
                @click="depositContext = null; depositOpen = true"
              >
                Deposit USDT
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <template v-if="walletLoading">
            <Skeleton class="h-12 w-72" />
          </template>
          <template v-else-if="walletError">
            <div class="text-sm text-destructive">Failed to load wallet.</div>
          </template>
          <template v-else-if="walletData">
            <div class="space-y-3">
              <div class="flex items-baseline justify-between">
                <div class="text-3xl font-semibold">{{ fmtUSDT(walletData.total) }}</div>
                <BaseStatusBadge :status="walletData.available < 2000 ? 'Low balance' : 'Healthy'" />
              </div>
              <div class="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div class="text-muted-foreground">Available</div>
                  <div class="text-foreground font-medium">{{ fmtUSDT(walletData.available) }}</div>
                </div>
                <div>
                  <div class="text-muted-foreground">Locked funds</div>
                  <div class="text-foreground font-medium">{{ fmtUSDT(walletData.locked) }}</div>
                </div>
                <div>
                  <div class="text-muted-foreground">Network</div>
                  <div class="text-foreground font-medium">TRON (TRC-20)</div>
                </div>
              </div>
              <p v-if="walletData.available < 2000" class="text-xs text-warning-foreground">
                Low available balance can block player deposit conversions.
              </p>
            </div>
          </template>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-lg font-semibold tracking-tight">Locked Balance</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4 pt-0">
          <template v-if="walletHealthStore.loading">
            <Skeleton class="h-9 w-28" />
            <Skeleton class="h-3 w-24" />
          </template>
          <template v-else-if="walletHealthStore.error">
            <p class="text-xs text-destructive">{{ walletHealthStore.error }}</p>
            <Button size="sm" variant="secondary" @click="walletHealthStore.fetchWalletHealth()">Retry</Button>
          </template>
          <template v-else>
            <div class="space-y-1.5">
              <div class="text-3xl font-semibold text-foreground leading-tight">
                {{ fmtUSDT(walletHealthStore.lockedBalanceUSDT) }}
              </div>
              <p class="text-xs text-muted-foreground">Currently locked</p>
              <p class="text-[11px] text-muted-foreground/80">Funds reserved for pending activity.</p>
            </div>
          </template>
        </CardContent>
      </Card>
    </div>

    <BaseTableWrapper title="Wallet Ledger">
      <template #tools>
        <Input v-model="search" placeholder="Search or reference…" class="h-9 max-w-[180px] text-sm" @input="clearRefParam" />
        <Select v-model="type" class="h-9 w-[160px] text-sm">
          <option v-for="t in LEDGER_TYPES" :key="t.label" :value="t.value">{{ t.label }}</option>
        </Select>
        <Select v-model="range" class="h-9 w-[120px] text-sm">
          <option value="">All time</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </Select>
        <Button size="sm" variant="secondary" class="h-9" :disabled="!csvRows.length" @click="exportCsv">Export CSV</Button>
        <Button size="sm" variant="secondary" class="h-9" :disabled="!csvRows.length" @click="exportPdf">Export PDF</Button>
      </template>

      <template v-if="ledgerLoading">
        <div class="space-y-0 py-4">
          <Skeleton v-for="n in 5" :key="n" class="h-12 w-full rounded-none first:rounded-t-lg last:rounded-b-lg" />
        </div>
      </template>
      <template v-else-if="ledgerError">
        <div class="py-8 text-center">
          <p class="text-sm text-destructive">Failed to load ledger.</p>
          <Button variant="secondary" class="mt-3" @click="ledgerQ.run?.()">Retry</Button>
        </div>
      </template>
      <template v-else-if="filtered.length === 0">
        <EmptyState title="No ledger entries" message="No entries match the current filters." />
      </template>
      <template v-else>
        <div class="overflow-x-auto">
          <BaseTable>
            <BaseTableHeader>
              <TRow>
                <TH>Date</TH>
                <TH>Type</TH>
                <TH>Description</TH>
                <TH>Amount</TH>
                <TH>Balance after</TH>
                <TH>Reference</TH>
              </TRow>
            </BaseTableHeader>
            <tbody>
              <TRow v-for="e in filtered" :key="e.id" class="cursor-pointer" @click="selected = e">
                <TD class="text-muted-foreground text-xs">{{ new Date(e.at).toLocaleString() }}</TD>
                <TD><BaseTagChip variant="info">{{ e.type }}</BaseTagChip></TD>
                <TD class="text-foreground max-w-[200px] truncate" :title="e.description">{{ e.description }}</TD>
                <TD :class="['font-medium tabular-nums', e.amount >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-destructive']">
                  {{ e.amount >= 0 ? "+" : "" }}{{ fmtUSDT(e.amount) }}
                </TD>
                <TD class="text-muted-foreground tabular-nums">{{ e.balanceAfter != null ? fmtUSDT(e.balanceAfter) : "–" }}</TD>
                <TD>
                  <div class="flex items-center gap-1.5 max-w-[120px]">
                    <span class="truncate text-muted-foreground text-xs" :title="e.refId">{{ e.refId }}</span>
                    <button type="button" class="p-1 rounded hover:bg-muted shrink-0" aria-label="Copy reference" @click.stop="copyToClipboard(e.refId, 'Reference copied', toast)">
                      <IconLucide name="copy" class="h-3.5 w-3.5" />
                    </button>
                  </div>
                </TD>
              </TRow>
            </tbody>
          </BaseTable>
        </div>
      </template>
      <template v-if="!ledgerLoading && !ledgerError && filtered.length > 0" #footer>
        <div class="text-xs text-muted-foreground">
          Showing <span class="font-medium text-foreground">{{ filtered.length }}</span> entries
        </div>
      </template>
    </BaseTableWrapper>

    <Modal
      :open="depositOpen"
      title="Deposit USDT (TRC-20)"
      :description="depositContext === 'prefunding' ? 'Top up wallet to clear blocked conversions. Identify your sending wallet, then send USDT on TRC-20.' : 'Identify your sending wallet, then send only USDT on TRC-20. Funds credit after network confirmations.'"
      :on-close="closeDepositPopup"
    >
      <div class="space-y-4">
        <!-- Source Wallet (required at top) -->
        <div class="rounded-xl border border-border bg-card/60 p-4 space-y-3">
          <div class="text-sm font-semibold text-foreground">Source wallet</div>
          <p class="text-xs text-muted-foreground">Declare the TRON (TRC-20) wallet you will send USDT from. Required before continuing.</p>
          <div class="flex flex-wrap items-center gap-2">
            <Input
              v-model="manualWalletAddress"
              placeholder="Your sending wallet address (e.g. T...)"
              class="flex-1 min-w-[240px] font-mono text-sm"
              @input="onManualWalletInput"
            />
            <Button
              size="sm"
              variant="secondary"
              :disabled="depositStore.connectLoading"
              @click="connectCoinductor"
            >
              {{ depositStore.connectLoading ? "Connecting…" : "Connect Coinductor Wallet" }}
            </Button>
          </div>
          <div v-if="sourceWalletDisplay" class="flex items-center gap-2 text-xs">
            <span :class="depositStore.sourceWallet?.verified ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'">
              {{ depositStore.sourceWallet?.verified ? "Verified" : "Unverified" }}
            </span>
            <span class="text-muted-foreground">•</span>
            <span class="font-mono text-muted-foreground truncate max-w-[280px]" :title="depositStore.sourceWallet?.address">{{ depositStore.sourceWallet?.address }}</span>
          </div>
          <p class="text-xs text-amber-600 dark:text-amber-400">
            Send USDT only from this wallet. Deposits from other wallets may be delayed or rejected.
          </p>
          <p v-if="sourceWalletError" class="text-xs text-destructive">{{ sourceWalletError }}</p>
        </div>

        <!-- Deposit instructions (only when source wallet is valid) -->
        <template v-if="depositStore.hasValidSourceWallet">
          <div class="rounded-xl border border-border bg-card/60 p-4 flex items-center justify-between gap-4">
            <div class="flex-1">
              <div class="text-xs text-muted-foreground">Deposit address</div>
              <div class="mt-1 flex items-center gap-2">
                <Input :model-value="depositAddress" readonly />
                <Button size="icon" variant="secondary" @click="copyToClipboard(depositAddress, 'Address copied')" aria-label="Copy address">
                  <IconLucide name="copy" class="h-4 w-4" />
                </Button>
              </div>
              <div class="mt-2 text-xs text-warning-foreground">Send only USDT on TRC-20. Other assets may be lost.</div>
            </div>
            <div class="h-28 w-28 rounded-xl border border-border bg-background flex items-center justify-center text-xs text-muted-foreground">
              QR (mock)
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="rounded-xl border border-border bg-card/60 p-4">
              <div class="text-sm font-semibold">Pending deposits</div>
              <div class="mt-2 space-y-2">
                <div v-if="pendingDeposits.length === 0" class="text-sm text-muted-foreground">No pending deposits.</div>
                <div v-else v-for="d in pendingDeposits" :key="d.id" class="rounded-lg border border-border bg-background/60 px-3 py-2">
                  <div class="flex items-center justify-between">
                    <div class="text-sm font-medium">{{ fmtUSDT(d.amount) }}</div>
                    <BaseStatusBadge status="Pending" />
                  </div>
                  <div class="mt-1 text-xs text-muted-foreground">{{ d.note }}</div>
                </div>
              </div>
            </div>
            <div class="rounded-xl border border-border bg-card/60 p-4">
              <div class="text-sm font-semibold">Confirmed deposits</div>
              <div class="mt-2 space-y-2">
                <div v-if="confirmedDeposits.length === 0" class="text-sm text-muted-foreground">No confirmed deposits yet.</div>
                <div v-else v-for="d in confirmedDeposits" :key="d.id" class="rounded-lg border border-border bg-background/60 px-3 py-2">
                  <div class="flex items-center justify-between">
                    <div class="text-sm font-medium">{{ fmtUSDT(d.amount) }}</div>
                    <BaseStatusBadge status="Confirmed" />
                  </div>
                  <div class="mt-1 text-xs text-muted-foreground">{{ new Date(d.at).toLocaleString() }} • {{ d.refId }}</div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="rounded-xl border border-border/60 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
          Enter your sending wallet address or connect Coinductor Wallet to continue.
        </div>
      </div>
      <template #footer>
        <div class="flex gap-2">
          <Button variant="secondary" @click="closeDepositPopup">Cancel</Button>
          <Button
            variant="primary"
            :disabled="!depositStore.hasValidSourceWallet"
            @click="confirmSentUsdt"
          >
            I have sent USDT
          </Button>
        </div>
      </template>
    </Modal>

    <!-- Withdraw dialog -->
    <Modal
      :open="withdrawOpen"
      title="Withdraw USDT"
      description="Send USDT to a TRON (TRC-20) address. Double-check the address before confirming."
      :on-close="closeWithdrawDialog"
    >
      <div class="space-y-4">
        <div class="rounded-xl border border-border bg-card/60 p-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Available balance</span>
            <span class="font-medium text-foreground">{{ fmtUSDT(availableBalanceUSDT) }} USDT</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Network</span>
            <span class="font-medium text-foreground">TRON (TRC-20)</span>
          </div>
        </div>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-foreground mb-1">Withdrawal address <span class="text-destructive">*</span></label>
            <Input
              v-model="withdrawalAddress"
              placeholder="T..."
              class="w-full font-mono text-sm"
            />
            <p v-if="withdrawalAddressInvalidMessage" class="mt-1 text-xs text-destructive">{{ withdrawalAddressInvalidMessage }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-1">Amount (USDT) <span class="text-destructive">*</span></label>
            <Input
              v-model="withdrawalAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="w-full"
            />
            <p v-if="withdrawalAmountInvalidMessage" class="mt-1 text-xs text-destructive">{{ withdrawalAmountInvalidMessage }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-1">Note / Reference (optional)</label>
            <Input v-model="withdrawNote" placeholder="Optional memo" class="w-full text-sm" />
          </div>
        </div>
        <p class="text-xs text-amber-600 dark:text-amber-400">
          Ensure the address is TRC-20 (TRON). Withdrawals to the wrong network may be lost.
        </p>
      </div>
      <template #footer>
        <div class="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            class="h-9 min-h-9 min-w-[120px]"
            @click="closeWithdrawDialog"
          >
            Cancel
          </Button>
          <Button
            type="button"
            class="wallet-btn wallet-btn-deposit h-9 min-h-9 min-w-[120px] px-4 rounded-md text-sm font-medium"
            :disabled="!canContinue || withdrawSubmitting"
            @click="openWithdrawConfirm"
          >
            {{ withdrawSubmitting ? "Submitting…" : "Continue" }}
          </Button>
        </div>
      </template>
    </Modal>

    <!-- Withdraw confirmation -->
    <Modal
      :open="withdrawConfirmOpen"
      title="Confirm withdrawal"
      description="Please confirm the details below."
      :on-close="() => (withdrawConfirmOpen = false)"
    >
      <div v-if="withdrawConfirmOpen" class="space-y-3 text-sm">
        <p class="text-foreground">Are you sure you want to withdraw <strong>{{ fmtUSDT(withdrawalAmountNum) }} USDT</strong> to <strong class="font-mono break-all">{{ withdrawalAddress }}</strong>?</p>
        <div class="rounded-xl border border-border bg-card/60 p-4 space-y-2">
          <div class="flex justify-between"><span class="text-muted-foreground">Amount</span><span class="font-medium">{{ fmtUSDT(withdrawalAmountNum) }} USDT</span></div>
          <div class="flex justify-between"><span class="text-muted-foreground">Address</span><span class="font-mono text-xs truncate max-w-[200px]" :title="withdrawalAddress">{{ withdrawalAddress }}</span></div>
          <div class="flex justify-between"><span class="text-muted-foreground">Network</span><span class="font-medium">TRC-20</span></div>
        </div>
      </div>
      <template #footer>
        <Button variant="secondary" @click="withdrawConfirmOpen = false">Cancel</Button>
        <Button
          class="wallet-btn-deposit h-9 px-4 rounded-md text-white text-sm font-medium"
          :disabled="withdrawSubmitting"
          @click="confirmWithdraw"
        >
          {{ withdrawSubmitting ? "Submitting…" : "Confirm Withdraw" }}
        </Button>
      </template>
    </Modal>

    <Drawer
      :open="!!selected"
      :title="selected ? 'Ledger entry' : 'Ledger'"
      :on-close="() => (selected = null)"
    >
      <template v-if="selected">
        <div class="space-y-4">
          <div class="rounded-xl border border-border bg-card/60 p-4">
            <div class="flex items-center justify-between">
              <div class="text-sm font-semibold">{{ selected.type }}</div>
              <BaseTagChip variant="info">{{ new Date(selected.at).toLocaleString() }}</BaseTagChip>
            </div>
            <div class="mt-3 text-sm text-foreground">{{ selected.description }}</div>
            <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div class="text-xs text-muted-foreground">Amount</div>
                <div :class="['font-semibold', selected.amount >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-destructive']">
                  {{ selected.amount >= 0 ? "+" : "" }}{{ fmtUSDT(selected.amount) }}
                </div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground">Balance after</div>
                <div class="font-semibold text-foreground">{{ selected.balanceAfter != null ? fmtUSDT(selected.balanceAfter) : "–" }}</div>
              </div>
              <div class="col-span-2">
                <div class="text-xs text-muted-foreground">Reference ID</div>
                <div class="flex items-center justify-between gap-2">
                  <div class="text-foreground break-all">{{ selected.refId }}</div>
                  <Button size="sm" variant="secondary" @click="copyToClipboard(selected.refId, 'Reference copied')">Copy</Button>
                </div>
              </div>
            </div>
          </div>
          <div class="rounded-xl border border-border bg-card/60 p-4">
            <div class="text-sm font-semibold">Quick links</div>
            <p class="mt-1 text-sm text-muted-foreground">Use reference filters to troubleshoot conversions, locks, and credits.</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                @click="applyRefFilter"
              >
                Filter ledger by ref
              </Button>
              <Button size="sm" variant="ghost" @click="clearSelected">Close</Button>
            </div>
          </div>
        </div>
      </template>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import IconLucide from "../../components/common/IconLucide.vue";
import Card from "../../components/ui/Card.vue";
import CardHeader from "../../components/ui/CardHeader.vue";
import CardTitle from "../../components/ui/CardTitle.vue";
import CardContent from "../../components/ui/CardContent.vue";
import BaseTableWrapper from "../../components/ui/BaseTableWrapper.vue";
import BaseTable from "../../components/ui/BaseTable.vue";
import BaseTableHeader from "../../components/ui/BaseTableHeader.vue";
import Button from "../../components/ui/Button.vue";
import Input from "../../components/ui/Input.vue";
import Select from "../../components/ui/Select.vue";
import BaseStatusBadge from "../../components/ui/BaseStatusBadge.vue";
import BaseTagChip from "../../components/ui/BaseTagChip.vue";
import TRow from "../../components/ui/TRow.vue";
import TH from "../../components/ui/TH.vue";
import TD from "../../components/ui/TD.vue";
import EmptyState from "../../components/ui/EmptyState.vue";
import Skeleton from "../../components/ui/Skeleton.vue";
import Modal from "../../components/ui/Modal.vue";
import Drawer from "../../components/ui/Drawer.vue";
import { copyToClipboard } from "../../utils/copyToClipboard";
import { useAsync } from "../../composables/useAsync";
import { api } from "../../services/client";
import { useToastStore } from "../../stores/toast";
import { useDepositStore, isValidTronAddress } from "../../stores/deposit";
import { useWalletHealthStore } from "../../stores/walletHealth";
import { useAuthStore } from "../../stores/auth";
import { fmtUSDT } from "../../utils/format";
import { downloadCsv } from "../../utils/csv";
import { printTableAsPdf } from "../../utils/print";
import type { LedgerEntry, LedgerType } from "../../types";

const LEDGER_TYPES: Array<{ label: string; value: "" | LedgerType }> = [
  { label: "All types", value: "" },
  { label: "Agent Deposit", value: "Agent Deposit" },
  { label: "Agent Withdrawal", value: "Agent Withdrawal" },
  { label: "Player Deposit Conversion", value: "Player Deposit Conversion" },
  { label: "Commission Credit", value: "Commission Credit" },
  { label: "War Entry Lock", value: "War Entry Lock" },
  { label: "Bonus Pool Co-fund", value: "Bonus Pool Co-fund" },
];

function inRange(iso: string, range: string) {
  if (!range) return true;
  const t = new Date(iso).getTime();
  const now = Date.now();
  const day = 86400000;
  const from = range === "7d" ? now - 7 * day : range === "30d" ? now - 30 * day : range === "90d" ? now - 90 * day : 0;
  return t >= from;
}

const route = useRoute();
const router = useRouter();
const toast = useToastStore();
const depositStore = useDepositStore();
const walletHealthStore = useWalletHealthStore();
const auth = useAuthStore();

const walletQ = useAsync(() => api.getWalletSummary(), []);
const ledgerQ = useAsync(() => api.getLedger(), []);

const walletLoading = walletQ.loading;
const walletError = walletQ.error;
const ledgerLoading = ledgerQ.loading;
const ledgerError = ledgerQ.error;
const walletData = computed(() => walletQ.data?.value ?? null);

const refParam = computed(() => (route.query.ref as string) ?? "");
const depositOpen = ref(false);
const selected = ref<LedgerEntry | null>(null);
const search = ref("");
const type = ref<"" | LedgerType>("");
const range = ref<"" | "7d" | "30d" | "90d">("30d");

const depositAddress = "TQm9wB3WmG5mrwu281324huewqnj7d2A";

const manualWalletAddress = ref("");
const sourceWalletError = ref("");
const sourceWalletDisplay = computed(() => depositStore.sourceWallet?.address ?? "");
const depositContext = ref<"prefunding" | null>(null);

const withdrawOpen = ref(false);
const withdrawConfirmOpen = ref(false);
const withdrawalAddress = ref("");
const withdrawalAmount = ref("");
const withdrawNote = ref("");
const withdrawSubmitting = ref(false);

/** Numeric available balance only (unit shown in UI). */
const availableBalanceUSDT = computed(() => {
  const v = walletData.value?.available;
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
});

/** Parsed amount for confirmation/API; use Number() for validation. */
const withdrawalAmountNum = computed(() => {
  const n = Number(withdrawalAmount.value);
  return Number.isFinite(n) ? n : 0;
});

/** Real-time: Continue enabled only when address + amount both valid. No blur dependency. */
const canContinue = computed(() => {
  const addr = (withdrawalAddress.value || "").trim();
  const isValidAddr = addr.length > 0 && addr.startsWith("T") && addr.length >= 30 && addr.length <= 40;

  const amt = Number(withdrawalAmount.value);
  const isValidAmt = Number.isFinite(amt) && amt > 0 && amt <= availableBalanceUSDT.value;

  return isValidAddr && isValidAmt;
});

/** Inline error messages (inform only; do not block typing). */
const withdrawalAddressInvalidMessage = computed(() => {
  const addr = (withdrawalAddress.value || "").trim();
  if (addr.length === 0) return "";
  if (!addr.startsWith("T") || addr.length < 30 || addr.length > 40) return "Enter a valid TRON (TRC-20) address.";
  return "";
});

const withdrawalAmountInvalidMessage = computed(() => {
  const raw = (withdrawalAmount.value || "").trim();
  if (raw === "") return "";
  const amt = Number(withdrawalAmount.value);
  if (!Number.isFinite(amt) || amt <= 0 || amt > availableBalanceUSDT.value) return "Enter an amount between 0 and your available balance.";
  return "";
});

function openWithdrawDialog() {
  withdrawOpen.value = true;
  withdrawalAddress.value = "";
  withdrawalAmount.value = "";
  withdrawNote.value = "";
  withdrawConfirmOpen.value = false;
}

function closeWithdrawDialog() {
  withdrawOpen.value = false;
  withdrawConfirmOpen.value = false;
  withdrawalAddress.value = "";
  withdrawalAmount.value = "";
  withdrawNote.value = "";
}

function openWithdrawConfirm() {
  if (!canContinue.value) return;
  withdrawConfirmOpen.value = true;
}

async function confirmWithdraw() {
  if (!canContinue.value) return;
  withdrawSubmitting.value = true;
  try {
    await walletHealthStore.requestWithdrawal({
      toAddress: withdrawalAddress.value.trim(),
      amount: withdrawalAmountNum.value,
      note: withdrawNote.value.trim() || undefined,
      agentId: auth.user?.agentId,
      network: "TRON_TR20",
    });
    await walletQ.run?.();
    await ledgerQ.run?.();
    toast.push({ title: "Withdrawal submitted successfully", tone: "success" });
    closeWithdrawDialog();
  } catch (e) {
    toast.push({
      title: "Withdrawal failed",
      message: e instanceof Error ? e.message : "Please try again.",
      tone: "danger",
    });
  } finally {
    withdrawSubmitting.value = false;
  }
}

function onManualWalletInput() {
  sourceWalletError.value = "";
  const v = manualWalletAddress.value.trim();
  if (!v) {
    depositStore.setManualSourceWallet("");
    return;
  }
  if (!isValidTronAddress(v)) {
    sourceWalletError.value = "Enter a valid TRON address (starts with T, 34 characters).";
    depositStore.setManualSourceWallet(v);
    return;
  }
  depositStore.setManualSourceWallet(v);
}

async function connectCoinductor() {
  const result = await depositStore.connectCoinductorWallet();
  if (result) {
    manualWalletAddress.value = result.address;
    sourceWalletError.value = "";
    toast.push({ title: "Wallet connected", message: "Coinductor wallet verified.", tone: "success" });
  } else {
    toast.push({ title: "Connection failed", message: "Could not connect Coinductor wallet.", tone: "danger" });
  }
}

function closeDepositPopup() {
  depositOpen.value = false;
  depositContext.value = null;
  depositStore.clearSourceWallet();
  manualWalletAddress.value = "";
  sourceWalletError.value = "";
}

async function confirmSentUsdt() {
  if (!depositStore.hasValidSourceWallet) return;
  const agentId = auth.user?.agentId ?? "unknown";
  const attempt = depositStore.createDepositAttempt({
    agentId,
    casinoDepositAddress: depositAddress,
  });
  if (!attempt) {
    closeDepositPopup();
    return;
  }
  const simulatedAmount = 500;
  if (typeof api.creditAgentDeposit === "function") {
    await api.creditAgentDeposit(simulatedAmount);
    await walletHealthStore.refreshWalletAfterDeposit();
    await walletQ.run?.();
    toast.push({ title: "Wallet topped up.", message: "Conversion health updated.", tone: "success" });
  } else {
    toast.push({ title: "Deposit pending.", message: "Conversion health will update once confirmed.", tone: "info" });
    await walletHealthStore.refreshWalletAfterDeposit();
  }
  closeDepositPopup();
}

onMounted(() => {
  walletHealthStore.fetchWalletHealth();
});

const filtered = computed(() => {
  const raw = ledgerQ.data?.value;
  const rows = Array.isArray(raw) ? raw : [];
  const s = (search.value || refParam.value).trim().toLowerCase();
  return rows.filter((e) => {
    const matchesType = !type.value || e.type === type.value;
    const matchesRange = inRange(e.at, range.value);
    const matchesSearch = !s || e.description.toLowerCase().includes(s) || e.refId.toLowerCase().includes(s) || e.type.toLowerCase().includes(s);
    return matchesType && matchesRange && matchesSearch;
  });
});

const csvRows = computed(() =>
  filtered.value.map((e) => ({
    at: new Date(e.at).toLocaleString(),
    type: e.type,
    description: e.description,
    amount: e.amount,
    balanceAfter: e.balanceAfter ?? "",
    refId: e.refId,
  }))
);

const pendingDeposits = computed(() => {
  const ledger = Array.isArray(ledgerQ.data?.value) ? ledgerQ.data.value : [];
  const hasRecentDeposit = ledger.some((e) => e.type === "Agent Deposit" && Date.now() - new Date(e.at).getTime() < 6 * 3600000);
  return hasRecentDeposit ? [] : [{ id: "dep_pending_01", amount: 250, note: "Waiting for TRC-20 confirmations" }];
});

const confirmedDeposits = computed(() => {
  const ledger = Array.isArray(ledgerQ.data?.value) ? ledgerQ.data.value : [];
  return ledger.filter((e) => e.type === "Agent Deposit").slice(0, 5);
});

watch(refParam, (v) => {
  if (v) search.value = v;
});

function clearRefParam() {
  if (refParam.value) router.replace({ query: {} });
}


function exportCsv() {
  downloadCsv("wallet-ledger.csv", csvRows.value);
  toast.push({ title: "Export created", message: "wallet-ledger.csv downloaded.", tone: "success" });
}

function clearSelected() {
  selected.value = null;
}

function applyRefFilter() {
  const s = selected.value;
  if (s) {
    router.replace({ query: { ref: s.refId } });
    selected.value = null;
    toast.push({ title: "Filter applied", message: "Ledger filtered by reference.", tone: "info" });
  }
}

function exportPdf() {
  printTableAsPdf({
    title: "Clazino – Wallet Ledger",
    columns: ["Date", "Type", "Description", "Amount", "Balance", "Ref"],
    rows: filtered.value.map((e) => [
      new Date(e.at).toLocaleString(),
      e.type,
      e.description,
      `${e.amount >= 0 ? "+" : ""}${fmtUSDT(e.amount)}`,
      e.balanceAfter != null ? fmtUSDT(e.balanceAfter) : "–",
      e.refId,
    ]),
  });
  toast.push({ title: "Export created", message: "Print dialog opened (save as PDF).", tone: "success" });
}
</script>

<style scoped>
/* Primary only (Deposit USDT, Continue, Confirm Withdraw). Withdraw/Cancel use variant="secondary" = same as View statements. */
.wallet-btn.wallet-btn-deposit {
  background: #1abc55 !important;
  color: #ffffff !important;
  border: none;
  box-shadow: none;
}
.wallet-btn.wallet-btn-deposit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.wallet-btn.wallet-btn-deposit:hover:not(:disabled) {
  filter: brightness(1.08);
}
.wallet-btn.wallet-btn-deposit:active:not(:disabled) {
  filter: brightness(0.95);
}
</style>
