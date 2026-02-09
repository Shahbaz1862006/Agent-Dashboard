<template>
  <div class="space-y-8">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-semibold tracking-tight text-foreground">Players</h1>
        <p class="mt-1 text-sm text-muted-foreground">Search, review status, and open full player profiles.</p>
      </div>
    </header>

    <!-- Suspend / Reactivate reason dialog -->
    <Modal
      :open="statusDialogOpen"
      :title="statusDialogTitle"
      :on-close="closeStatusDialog"
      width-class="max-w-md"
    >
      <div class="space-y-4">
        <div v-if="selectedPlayer" class="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
          <div class="font-medium text-foreground">{{ selectedPlayer.name }}</div>
          <div class="text-muted-foreground">@{{ selectedPlayer.username }} · {{ selectedPlayer.id }}</div>
          <div class="mt-1">
            <BaseStatusBadge :status="selectedPlayer.status" />
          </div>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-foreground">Reason</label>
          <textarea
            v-model="statusReason"
            rows="4"
            class="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y min-h-[80px]"
            :placeholder="statusReasonPlaceholder"
          />
          <p v-if="statusReasonTouched && !statusReasonValid" class="mt-1 text-xs text-destructive">
            Reason is required (at least 10 characters).
          </p>
        </div>
      </div>
      <template #footer>
        <Button type="button" variant="secondary" @click="closeStatusDialog">Cancel</Button>
        <Button
          type="button"
          :disabled="!statusReasonValid || statusActionLoading"
          @click="confirmStatusAction"
        >
          {{ statusConfirmLabel }}
        </Button>
      </template>
    </Modal>

    <BaseTableWrapper title="Player list">
      <template #tools>
        <div class="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <Input
            v-model="search"
            placeholder="Search by name, username, or ID"
            class="h-9 min-h-9 min-w-0 flex-1 sm:max-w-[220px] text-sm"
            @input="resetPage"
          />
          <Select v-model="statusFilter" class="h-9 min-h-9 w-[130px] shrink-0 text-sm" @update:model-value="resetPage">
            <option value="">All status</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Restricted">Restricted</option>
          </Select>
          <Select v-model="kyc" class="h-9 min-h-9 w-[130px] shrink-0 text-sm" @update:model-value="resetPage">
            <option value="">All KYC</option>
            <option value="Tier A">Tier A</option>
            <option value="Tier B">Tier B</option>
            <option value="Tier C">Tier C</option>
          </Select>
        </div>
      </template>

      <template v-if="loading">
        <div class="space-y-0 py-4">
          <Skeleton v-for="n in 5" :key="n" class="h-12 w-full rounded-none first:rounded-t-lg last:rounded-b-lg" />
        </div>
      </template>
      <template v-else-if="error">
        <div class="py-8 text-center">
          <p class="text-sm text-destructive">Failed to load players.</p>
          <Button variant="secondary" class="mt-3" @click="playersStore.fetchPlayers()">Retry</Button>
        </div>
      </template>
      <template v-else-if="filtered.length === 0">
        <EmptyState title="No players found" message="Try adjusting your search or filters." />
      </template>
      <template v-else>
        <!-- Mobile: card list -->
        <div class="md:hidden divide-y divide-border/60">
          <div
            v-for="p in paged"
            :key="p.id"
            class="py-4 space-y-2 cursor-pointer"
            @click="router.push(`/dashboard/players/${p.id}`)"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="font-medium text-foreground">{{ p.name }}</div>
              <BaseStatusBadge :status="p.status" />
            </div>
            <div class="text-xs text-muted-foreground">@{{ p.username }}</div>
            <div class="flex flex-wrap items-center gap-2">
              <BaseStatusBadge :status="p.kycTier" :tone="p.kycTier === 'Tier A' ? 'success' : p.kycTier === 'Tier B' ? 'warning' : 'danger'" />
              <span class="text-sm font-medium tabular-nums">{{ fmtUSDT(p.balanceAvailable) }}</span>
            </div>
            <div class="flex justify-between items-center pt-1">
              <span class="text-xs text-muted-foreground">{{ new Date(p.lastActive).toLocaleDateString() }}</span>
              <div @click.stop>
                <BaseRowActionsMenu aria-label="Player actions">
                  <button type="button" class="w-full px-3 py-2 text-left text-sm hover:bg-muted rounded-none first:rounded-t-lg last:rounded-b-lg" @click="router.push(`/dashboard/players/${p.id}`)">View profile</button>
                  <button type="button" class="w-full px-3 py-2 text-left text-sm hover:bg-muted" @click="copyId(p.id)">Copy ID</button>
                  <button v-if="canSuspend && p.status === 'Active'" type="button" class="w-full px-3 py-2 text-left text-sm hover:bg-muted text-foreground" @click="openStatusDialog(p, 'suspend')">Suspend</button>
                  <button v-if="canRestrict && p.status === 'Active'" type="button" class="w-full px-3 py-2 text-left text-sm hover:bg-muted text-foreground" @click="openStatusDialog(p, 'restrict')">Restrict</button>
                  <button v-if="canReactivate && p.status === 'Suspended'" type="button" class="w-full px-3 py-2 text-left text-sm hover:bg-muted text-foreground" @click="openStatusDialog(p, 'reactivate')">Reactivate</button>
                  <button v-if="canUnrestrict && p.status === 'Restricted'" type="button" class="w-full px-3 py-2 text-left text-sm hover:bg-muted text-foreground" @click="openStatusDialog(p, 'unrestrict')">Unrestrict</button>
                </BaseRowActionsMenu>
              </div>
            </div>
          </div>
        </div>
        <!-- Desktop: table -->
        <div class="hidden md:block overflow-x-auto">
          <BaseTable>
            <BaseTableHeader>
              <TRow>
                <TH>Player</TH>
                <TH>KYC</TH>
                <TH>Status</TH>
                <TH>Available</TH>
                <TH>Last active</TH>
                <TH class="w-[52px]"></TH>
              </TRow>
            </BaseTableHeader>
            <tbody>
              <TRow v-for="p in paged" :key="p.id" class="cursor-pointer" @click="router.push(`/dashboard/players/${p.id}`)">
                <TD>
                  <div class="font-medium text-foreground">{{ p.name }}</div>
                  <div class="text-xs text-muted-foreground truncate max-w-[180px]" :title="`@${p.username} • ${p.id}`">@{{ p.username }}</div>
                </TD>
                <TD><BaseStatusBadge :status="p.kycTier" :tone="p.kycTier === 'Tier A' ? 'success' : p.kycTier === 'Tier B' ? 'warning' : 'danger'" /></TD>
                <TD><BaseStatusBadge :status="p.status" /></TD>
                <TD class="font-medium tabular-nums">{{ fmtUSDT(p.balanceAvailable) }}</TD>
                <TD class="text-muted-foreground text-xs">{{ new Date(p.lastActive).toLocaleDateString() }}</TD>
                <TD @click.stop>
                  <BaseRowActionsMenu aria-label="Player actions">
                    <button type="button" class="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted rounded-none first:rounded-t-lg last:rounded-b-lg" @click="router.push(`/dashboard/players/${p.id}`)">View profile</button>
                    <button type="button" class="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted" @click="copyId(p.id)">Copy ID</button>
                    <button v-if="canSuspend && p.status === 'Active'" type="button" class="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted" @click="openStatusDialog(p, 'suspend')">Suspend</button>
                    <button v-if="canRestrict && p.status === 'Active'" type="button" class="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted" @click="openStatusDialog(p, 'restrict')">Restrict</button>
                    <button v-if="canReactivate && p.status === 'Suspended'" type="button" class="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted" @click="openStatusDialog(p, 'reactivate')">Reactivate</button>
                    <button v-if="canUnrestrict && p.status === 'Restricted'" type="button" class="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted" @click="openStatusDialog(p, 'unrestrict')">Unrestrict</button>
                  </BaseRowActionsMenu>
                </TD>
              </TRow>
            </tbody>
          </BaseTable>
        </div>
      </template>
      <template v-if="!loading && !error && filtered.length > 0" #footer>
        <TablePagination
          :page="page"
          :page-size="pageSize"
          :total="filtered.length"
          :on-page-change="setPage"
        />
      </template>
    </BaseTableWrapper>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import BaseTableWrapper from "../../components/ui/BaseTableWrapper.vue";
import BaseTable from "../../components/ui/BaseTable.vue";
import BaseTableHeader from "../../components/ui/BaseTableHeader.vue";
import Input from "../../components/ui/Input.vue";
import Select from "../../components/ui/Select.vue";
import TRow from "../../components/ui/TRow.vue";
import TH from "../../components/ui/TH.vue";
import TD from "../../components/ui/TD.vue";
import BaseStatusBadge from "../../components/ui/BaseStatusBadge.vue";
import BaseRowActionsMenu from "../../components/ui/BaseRowActionsMenu.vue";
import EmptyState from "../../components/ui/EmptyState.vue";
import TablePagination from "../../components/ui/TablePagination.vue";
import Button from "../../components/ui/Button.vue";
import Skeleton from "../../components/ui/Skeleton.vue";
import Modal from "../../components/ui/Modal.vue";
import { copyToClipboard } from "../../utils/copyToClipboard";
import { useToastStore } from "../../stores/toast";
import { usePermissionStore } from "../../stores/permission";
import { usePlayersStore } from "../../stores/players";
import { fmtUSDT } from "../../utils/format";
import type { KycTier, Player, PlayerStatus } from "../../types";

const router = useRouter();
const toast = useToastStore();
const permission = usePermissionStore();
const playersStore = usePlayersStore();

onMounted(() => {
  playersStore.fetchPlayers();
});

const loading = computed(() => playersStore.loading);
const error = computed(() => playersStore.error);
const search = ref("");
const statusFilter = ref<"" | PlayerStatus>("");
const kyc = ref<"" | KycTier>("");
const page = ref(1);
const pageSize = 10;

const canSuspend = permission.can("suspend_player");
const canReactivate = permission.can("reactivate_player");
const canRestrict = permission.can("restrict_player");
const canUnrestrict = permission.can("unrestrict_player");

type StatusActionMode = "suspend" | "reactivate" | "restrict" | "unrestrict";

// Status change dialog (Suspend / Reactivate / Restrict / Unrestrict)
const statusDialogOpen = ref(false);
const statusDialogMode = ref<StatusActionMode>("suspend");
const selectedPlayer = ref<Player | null>(null);
const statusReason = ref("");
const statusReasonTouched = ref(false);
const statusActionLoading = computed(() => playersStore.actionLoading);

const STATUS_DIALOG_TITLES: Record<StatusActionMode, string> = {
  suspend: "Suspend Player",
  reactivate: "Reactivate Player",
  restrict: "Restrict Player",
  unrestrict: "Unrestrict Player",
};

const statusDialogTitle = computed(() => STATUS_DIALOG_TITLES[statusDialogMode.value]);

const STATUS_REASON_PLACEHOLDERS: Record<StatusActionMode, string> = {
  suspend: "Explain why you are suspending this player.",
  reactivate: "Explain why you are reactivating this player.",
  restrict: "Explain why you are restricting this player.",
  unrestrict: "Explain why you are unrestricting this player.",
};

const statusReasonPlaceholder = computed(() => STATUS_REASON_PLACEHOLDERS[statusDialogMode.value]);

const STATUS_CONFIRM_LABELS: Record<StatusActionMode, string> = {
  suspend: "Confirm Suspend",
  reactivate: "Confirm Reactivate",
  restrict: "Confirm Restrict",
  unrestrict: "Confirm Unrestrict",
};

const statusConfirmLabel = computed(() => STATUS_CONFIRM_LABELS[statusDialogMode.value]);

const statusReasonValid = computed(() => {
  const trimmed = statusReason.value.trim();
  return trimmed.length >= 10;
});

watch(statusReason, () => {
  if (statusReason.value) statusReasonTouched.value = true;
});

function openStatusDialog(p: Player, mode: StatusActionMode) {
  selectedPlayer.value = p;
  statusDialogMode.value = mode;
  statusReason.value = "";
  statusReasonTouched.value = false;
  statusDialogOpen.value = true;
}

function closeStatusDialog() {
  statusDialogOpen.value = false;
  selectedPlayer.value = null;
  statusReason.value = "";
  statusReasonTouched.value = false;
}

const TOAST_TITLES: Record<StatusActionMode, string> = {
  suspend: "Player suspended",
  reactivate: "Player reactivated",
  restrict: "Player restricted",
  unrestrict: "Player unrestricted",
};

async function confirmStatusAction() {
  const player = selectedPlayer.value;
  if (!player || !statusReasonValid.value) return;
  const reason = statusReason.value.trim();
  const mode = statusDialogMode.value;

  try {
    if (mode === "suspend") await playersStore.suspendPlayer(player.id, reason);
    else if (mode === "reactivate") await playersStore.reactivatePlayer(player.id, reason);
    else if (mode === "restrict") await playersStore.restrictPlayer(player.id, reason);
    else await playersStore.unrestrictPlayer(player.id, reason);

    toast.push({ title: TOAST_TITLES[mode], tone: "success" });
    closeStatusDialog();
  } catch (e) {
    toast.push({
      title: "Action failed",
      message: (e as Error)?.message ?? "Please try again.",
      tone: "danger",
    });
  }
}

function copyId(id: string) {
  copyToClipboard(id, "Player ID copied", toast);
}

const filtered = computed(() => {
  const rows = playersStore.list;
  return rows.filter((p) => {
    const s = search.value.trim().toLowerCase();
    const matchesSearch = !s || p.name.toLowerCase().includes(s) || p.username.toLowerCase().includes(s) || p.id.toLowerCase().includes(s);
    const matchesStatus = !statusFilter.value || p.status === statusFilter.value;
    const matchesKyc = !kyc.value || p.kycTier === kyc.value;
    return matchesSearch && matchesStatus && matchesKyc;
  });
});

const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize));

function resetPage() {
  page.value = 1;
}
function setPage(p: number) {
  page.value = p;
}
</script>
