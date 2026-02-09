<template>
  <div class="space-y-8">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-semibold tracking-tight text-foreground">Payouts</h1>
        <p class="mt-1 text-sm text-muted-foreground">Approve, decline, or escalate payout requests. Only approved payouts are processed.</p>
        <p v-if="!payoutsStore.loading && pendingCount > 0" class="mt-2 text-sm">
          <span class="font-medium text-foreground">{{ pendingCount }}</span>
          <span class="text-muted-foreground"> pending request{{ pendingCount === 1 ? '' : 's' }} — use the row menu (⋯) to act.</span>
        </p>
      </div>
    </header>

    <BaseTableWrapper title="Requests">
      <template #description>
        <span class="text-muted-foreground">All payout requests including <strong class="text-foreground">Pending</strong>. Use the row menu (⋯) to Approve, Decline, or Escalate pending requests.</span>
      </template>
      <template #tools>
        <div class="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <Input v-model="search" placeholder="Search by player or ID" class="h-9 min-h-9 min-w-0 flex-1 sm:max-w-[220px] text-sm" />
          <Select v-model="statusFilter" class="h-9 min-h-9 w-[140px] shrink-0 text-sm">
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Declined">Declined</option>
            <option value="Escalate">Escalate</option>
          </Select>
        </div>
      </template>

      <template v-if="payoutsStore.loading">
        <div class="space-y-0 py-4">
          <Skeleton v-for="n in 5" :key="n" class="h-12 w-full rounded-none first:rounded-t-lg last:rounded-b-lg" />
        </div>
      </template>
      <template v-else-if="payoutsStore.error">
        <div class="py-8 text-center">
          <p class="text-sm text-destructive">{{ payoutsStore.error }}</p>
          <Button variant="secondary" class="mt-3" @click="payoutsStore.fetchPayouts()">Retry</Button>
        </div>
      </template>
      <template v-else-if="filtered.length === 0">
        <EmptyState title="No payouts found" message="Payout requests will appear here." />
      </template>
      <template v-else>
        <div class="overflow-x-auto">
          <BaseTable>
            <BaseTableHeader>
              <TRow>
                <TH>ID</TH>
                <TH>Player</TH>
                <TH>Method</TH>
                <TH>Status</TH>
                <TH>Amount</TH>
                <TH>Requested</TH>
                <TH class="w-[52px]"></TH>
              </TRow>
            </BaseTableHeader>
            <tbody>
              <TRow v-for="p in paged" :key="p.id" class="cursor-pointer" @click="selectedPayout = p">
                <TD class="font-mono text-xs text-muted-foreground truncate max-w-[80px]" :title="p.id">{{ p.id }}</TD>
                <TD class="font-medium text-foreground">{{ p.playerName }}</TD>
                <TD class="text-muted-foreground text-sm">{{ p.method }}</TD>
                <TD class="text-left">
                  <!-- Badge only: Pending | Approved | Declined | Escalate (no plain text) -->
                  <BaseStatusBadge :status="payoutDisplayStatus(p)" />
                </TD>
                <TD class="font-medium tabular-nums">{{ fmtUSDT(p.amount) }}</TD>
                <TD class="text-muted-foreground text-xs">{{ formatDate(p.requestedAt) }}</TD>
                <TD @click.stop class="text-left">
                  <!-- Agent actions (⋯) only for Pending; Approved/Declined/Escalate are final — no menu -->
                  <BaseRowActionsMenu v-if="canActOnPayout && isPending(p)" aria-label="Payout actions">
                    <button type="button" class="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted rounded-none first:rounded-t-lg" @click="openApprove(p)">Approve</button>
                    <button type="button" class="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted" @click="openDecline(p)">Decline</button>
                    <button type="button" class="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted last:rounded-b-lg" @click="openEscalate(p)">Escalate to Support</button>
                  </BaseRowActionsMenu>
                  <span v-else class="text-muted-foreground text-xs">—</span>
                </TD>
              </TRow>
            </tbody>
          </BaseTable>
        </div>
      </template>
      <template v-if="!payoutsStore.loading && !payoutsStore.error && filtered.length > 0 && totalPages > 1" #footer>
        <TablePagination
          :page="page"
          :page-size="pageSize"
          :total="filtered.length"
          :on-page-change="setPage"
        />
      </template>
    </BaseTableWrapper>

    <!-- Detail drawer -->
    <Drawer
      :open="!!selectedPayout"
      :title="selectedPayout ? `Payout ${selectedPayout.id}` : ''"
      :on-close="() => (selectedPayout = null)"
    >
      <template v-if="selectedPayout">
        <div class="space-y-4">
          <div class="rounded-xl border border-border bg-card/60 p-4 space-y-3">
            <div class="flex items-center justify-between">
              <div class="text-sm font-semibold text-foreground">Player</div>
              <BaseStatusBadge :status="payoutDisplayStatus(selectedPayout)" />
            </div>
            <div class="text-lg font-semibold text-foreground">{{ selectedPayout.playerName }}</div>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-muted-foreground">Amount</span>
                <div class="font-semibold text-foreground">{{ fmtUSDT(selectedPayout.amount) }}</div>
              </div>
              <div>
                <span class="text-muted-foreground">Method</span>
                <div class="font-medium text-foreground">{{ selectedPayout.method }}</div>
              </div>
              <div class="col-span-2">
                <span class="text-muted-foreground">Destination</span>
                <div class="font-mono text-sm text-foreground">{{ selectedPayout.destinationMasked }}</div>
              </div>
            </div>
          </div>
          <div class="rounded-xl border border-border bg-card/60 p-4">
            <div class="text-sm font-semibold text-foreground mb-3">Timeline</div>
            <div class="space-y-2">
              <div
                v-for="(t, i) in selectedPayout.timeline"
                :key="i"
                class="flex items-start gap-3 text-sm"
              >
                <span class="text-muted-foreground shrink-0">{{ formatDate(t.at) }}</span>
                <div>
                  <span class="font-medium text-foreground">{{ t.status }}</span>
                  <span v-if="t.note" class="text-muted-foreground"> – {{ t.note }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="canActOnPayout && isPending(selectedPayout)" class="rounded-xl border border-border bg-card/60 p-4">
            <div class="text-sm font-semibold text-foreground mb-2">Agent actions</div>
            <div class="flex flex-wrap gap-2">
              <Button size="sm" variant="primary" @click="openApprove(selectedPayout); selectedPayout = null">Approve</Button>
              <Button size="sm" variant="secondary" @click="openDecline(selectedPayout); selectedPayout = null">Decline</Button>
              <Button size="sm" variant="secondary" @click="openEscalate(selectedPayout); selectedPayout = null">Escalate to Support</Button>
            </div>
          </div>
          <div v-else class="rounded-xl border border-border bg-card/60 p-4">
            <p class="text-sm text-muted-foreground">No further actions available for this payout.</p>
          </div>
        </div>
      </template>
    </Drawer>

    <!-- Approve confirmation -->
    <Modal
      :open="!!approveTarget"
      title="Approve payout"
      description="Are you sure you want to approve this payout?"
      :on-close="() => (approveTarget = null)"
    >
      <template v-if="approveTarget">
        <div class="space-y-2 text-sm">
          <div class="flex justify-between"><span class="text-muted-foreground">Amount</span><span class="font-medium">{{ fmtUSDT(approveTarget.amount) }}</span></div>
          <div class="flex justify-between"><span class="text-muted-foreground">Player</span><span class="font-medium">{{ approveTarget.playerName }}</span></div>
          <div class="flex justify-between"><span class="text-muted-foreground">Method</span><span class="font-medium">{{ approveTarget.method }}</span></div>
          <div class="flex justify-between"><span class="text-muted-foreground">Request ID</span><span class="font-mono text-xs">{{ approveTarget.id }}</span></div>
          <div class="flex justify-between"><span class="text-muted-foreground">Requested</span><span class="font-medium">{{ formatDate(approveTarget.requestedAt) }}</span></div>
        </div>
      </template>
      <template #footer>
        <Button variant="ghost" @click="approveTarget = null">Cancel</Button>
        <Button variant="primary" :disabled="approveLoading" @click="confirmApprove">Confirm approve</Button>
      </template>
    </Modal>

    <!-- Decline: mandatory message to user -->
    <Modal
      :open="!!declineTarget"
      title="Decline Payout"
      description="This payout will be cancelled. You must provide a message to the user."
      :on-close="closeDecline"
    >
      <template v-if="declineTarget">
        <div class="space-y-3">
          <label class="block text-sm font-medium text-foreground">Message to User</label>
          <textarea
            v-model="declineReason"
            class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px]"
            placeholder="e.g. Insufficient verification. Please complete KYC and try again."
            minlength="10"
          />
          <p v-if="declineReasonTouched && declineReason.trim().length < 10" class="text-xs text-destructive">Message is required (at least 10 characters).</p>
        </div>
      </template>
      <template #footer>
        <Button variant="ghost" @click="closeDecline">Cancel</Button>
        <Button variant="danger" :disabled="declineLoading || !declineReasonValid" @click="confirmDecline">Decline and cancel</Button>
      </template>
    </Modal>

    <!-- Escalate to Support -->
    <Modal
      :open="!!escalateTarget"
      title="Escalate Payout"
      description="Create a support ticket linked to this payout. Notes are recommended."
      :on-close="closeEscalate"
    >
      <template v-if="escalateTarget">
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-foreground mb-1">Notes (optional)</label>
            <textarea
              v-model="escalateNotes"
              class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px]"
              placeholder="Describe the issue for support..."
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-1">Category (optional)</label>
            <Select v-model="escalateCategory" class="w-full text-sm">
              <option value="">Select category</option>
              <option value="Verification">Verification</option>
              <option value="Technical">Technical</option>
              <option value="Compliance">Compliance</option>
              <option value="Other">Other</option>
            </Select>
          </div>
        </div>
      </template>
      <template #footer>
        <Button variant="ghost" @click="closeEscalate">Cancel</Button>
        <Button variant="primary" :disabled="escalateLoading" @click="confirmEscalate">Escalate</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import BaseTableWrapper from "../../components/ui/BaseTableWrapper.vue";
import BaseTable from "../../components/ui/BaseTable.vue";
import BaseTableHeader from "../../components/ui/BaseTableHeader.vue";
import Input from "../../components/ui/Input.vue";
import Select from "../../components/ui/Select.vue";
import TRow from "../../components/ui/TRow.vue";
import TH from "../../components/ui/TH.vue";
import TD from "../../components/ui/TD.vue";
import EmptyState from "../../components/ui/EmptyState.vue";
import TablePagination from "../../components/ui/TablePagination.vue";
import Skeleton from "../../components/ui/Skeleton.vue";
import Drawer from "../../components/ui/Drawer.vue";
import Button from "../../components/ui/Button.vue";
import Modal from "../../components/ui/Modal.vue";
import BaseStatusBadge from "../../components/ui/BaseStatusBadge.vue";
import BaseRowActionsMenu from "../../components/ui/BaseRowActionsMenu.vue";
import { usePayoutsStore } from "../../stores/payouts";
import { usePermissionStore } from "../../stores/permission";
import { useToastStore } from "../../stores/toast";
import { fmtUSDT } from "../../utils/format";
import type { Payout, PayoutStatus } from "../../types";

const payoutsStore = usePayoutsStore();
const permissionStore = usePermissionStore();
const toast = useToastStore();

const canActOnPayout = computed(() => permissionStore.can("approve_payout") && permissionStore.can("decline_payout") && permissionStore.can("escalate_payout"));

const search = ref("");
const statusFilter = ref<"" | PayoutStatus>("");
const selectedPayout = ref<Payout | null>(null);
const page = ref(1);
const pageSize = 10;

const approveTarget = ref<Payout | null>(null);
const declineTarget = ref<Payout | null>(null);
const escalateTarget = ref<Payout | null>(null);
const approveLoading = ref(false);
const declineLoading = ref(false);
const escalateLoading = ref(false);
const declineReason = ref("");
const declineReasonTouched = ref(false);
const escalateNotes = ref("");
const escalateCategory = ref("");

function isPending(p: Payout): boolean {
  return p.status === undefined || p.status === "Pending";
}

/** Only these four statuses; always show as badge. Default unknown/empty to Pending. */
function payoutDisplayStatus(p: Payout): "Pending" | "Approved" | "Declined" | "Escalate" {
  const s = p.status;
  if (s === "Approved" || s === "Declined" || s === "Escalate") return s;
  return "Pending";
}

/** Count of Pending payouts (for display in header). */
const pendingCount = computed(() => {
  const list = Array.isArray(payoutsStore.list) ? payoutsStore.list : [];
  return list.filter((p) => isPending(p)).length;
});

/** All statuses (Pending, Approved, Declined, Escalate). "All" filter shows every request; no default exclusion of Pending. */
const filtered = computed(() => {
  const rows = Array.isArray(payoutsStore.list) ? payoutsStore.list : [];
  const s = search.value.trim().toLowerCase();
  return rows.filter((p) => {
    const matchesSearch = !s || p.playerName.toLowerCase().includes(s) || p.id.toLowerCase().includes(s);
    const st = statusFilter.value;
    const matchesStatus = !st || (st === "Pending" ? isPending(p) : p.status === st);
    return matchesSearch && matchesStatus;
  });
});

const declineReasonValid = computed(() => declineReason.value.trim().length >= 10);
watch(declineReason, () => { if (declineReason.value) declineReasonTouched.value = true; });

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)));
const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize));

function setPage(p: number) {
  page.value = p;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function openApprove(p: Payout) {
  approveTarget.value = p;
}
function openDecline(p: Payout) {
  declineTarget.value = p;
  declineReason.value = "";
  declineReasonTouched.value = false;
}
function closeDecline() {
  declineTarget.value = null;
  declineReason.value = "";
}
function openEscalate(p: Payout) {
  escalateTarget.value = p;
  escalateNotes.value = "";
  escalateCategory.value = "";
}
function closeEscalate() {
  escalateTarget.value = null;
  escalateNotes.value = "";
  escalateCategory.value = "";
}

async function confirmApprove() {
  if (!approveTarget.value) return;
  approveLoading.value = true;
  try {
    await payoutsStore.approvePayout(approveTarget.value.id);
    toast.push({ title: "Payout approved successfully", tone: "success" });
    approveTarget.value = null;
  } catch {
    toast.push({ title: "Payout failed", message: "Please try again or escalate to support.", tone: "danger" });
  } finally {
    approveLoading.value = false;
  }
}

async function confirmDecline() {
  if (!declineTarget.value || !declineReasonValid.value) return;
  declineLoading.value = true;
  try {
    await payoutsStore.declinePayout(declineTarget.value.id, declineReason.value.trim());
    toast.push({ title: "Payout declined. Message sent to user.", tone: "success" });
    closeDecline();
  } catch {
    toast.push({ title: "Failed to decline", message: "Please try again.", tone: "danger" });
  } finally {
    declineLoading.value = false;
  }
}

async function confirmEscalate() {
  if (!escalateTarget.value) return;
  escalateLoading.value = true;
  try {
    await payoutsStore.escalatePayout(escalateTarget.value.id, {
      notes: escalateNotes.value.trim(),
      category: escalateCategory.value || undefined,
    });
    toast.push({ title: "Payout escalated to support", tone: "success" });
    closeEscalate();
  } catch {
    toast.push({ title: "Failed to escalate", message: "Please try again.", tone: "danger" });
  } finally {
    escalateLoading.value = false;
  }
}

onMounted(() => {
  payoutsStore.fetchPayouts();
});
</script>
