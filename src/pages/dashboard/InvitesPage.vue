<template>
  <div class="space-y-8">
    <!-- Top header: title + primary CTA -->
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-semibold tracking-tight text-foreground">Invitations</h1>
        <p class="mt-1 text-sm text-muted-foreground">Create and manage invites. Expiry: 7 days.</p>
      </div>
      <div class="flex-shrink-0">
        <Button variant="primary" size="default" class="min-w-[140px]" @click="createOpen = true">
          Create Invite
        </Button>
      </div>
    </header>

    <!-- Analytics: two compact stat cards (soft elevation, click to filter) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        type="button"
        class="text-left rounded-2xl border border-border bg-card text-card-foreground shadow-panel p-5 transition-colors hover:bg-muted/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :class="{ 'ring-2 ring-primary/30 bg-primary/5': statusFilter === 'PENDING' }"
        @click="statusFilter = statusFilter === 'PENDING' ? '' : 'PENDING'"
      >
        <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pending invites</p>
        <p class="mt-1 text-2xl font-semibold text-foreground" aria-live="polite">{{ store.pendingCount }}</p>
      </button>
      <button
        type="button"
        class="text-left rounded-2xl border border-border bg-card text-card-foreground shadow-panel p-5 transition-colors hover:bg-muted/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :class="{ 'ring-2 ring-primary/30 bg-primary/5': statusFilter === 'COMPLETED' }"
        @click="statusFilter = statusFilter === 'COMPLETED' ? '' : 'COMPLETED'"
      >
        <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Completed invites</p>
        <p class="mt-1 text-2xl font-semibold text-foreground" aria-live="polite">{{ store.completedCount }}</p>
      </button>
    </div>

    <!-- Invites list: modern table + mobile cards -->
    <BaseTableWrapper title="Invites">
      <template #tools>
        <Input
          v-model="search"
          placeholder="Search by name"
          class="h-9 max-w-[180px] text-sm"
          aria-label="Search invites by name"
        />
        <Select v-model="statusFilter" class="h-9 w-[130px] text-sm" aria-label="Filter by status">
          <option value="">All status</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
        </Select>
      </template>
        <!-- Skeleton loader -->
        <template v-if="store.loading && store.invitations.length === 0">
          <div class="space-y-0 py-4">
            <Skeleton v-for="n in 5" :key="n" class="h-12 w-full rounded-none first:rounded-t-lg last:rounded-b-lg" />
          </div>
        </template>
        <template v-else-if="store.error">
          <div class="py-8 text-center">
            <p class="text-sm text-destructive">Failed to load invites.</p>
            <Button variant="secondary" class="mt-3" @click="() => store.fetchInvitations()">Retry</Button>
          </div>
        </template>
        <template v-else-if="filteredRows.length === 0">
          <EmptyState title="No invites yet" message="Create an invite to get started.">
            <template #action>
              <Button variant="primary" @click="createOpen = true">Create Invite</Button>
            </template>
          </EmptyState>
        </template>
        <template v-else>
          <!-- Desktop: table with sticky header -->
          <div class="hidden md:block overflow-x-auto">
            <BaseTable role="grid" aria-label="Invites list">
              <BaseTableHeader>
                <TRow>
                  <TH>Name</TH>
                  <TH>Code</TH>
                  <TH>Methods</TH>
                  <TH>Status</TH>
                  <TH>Created</TH>
                  <TH>Expires</TH>
                  <TH>Actions</TH>
                </TRow>
              </BaseTableHeader>
              <tbody>
                <TRow v-for="i in filteredRows" :key="i.id">
                  <TD><span class="font-medium text-foreground">{{ i.firstName }} {{ i.lastName }}</span></TD>
                  <TD>
                    <div class="flex items-center gap-1.5">
                      <span class="font-mono text-xs text-foreground truncate max-w-[100px]" :title="i.invitationCode">{{ i.invitationCode }}</span>
                      <button type="button" class="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0" aria-label="Copy invitation code" @click.stop="copyCode(i.invitationCode)">
                        <IconLucide name="copy" class="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TD>
                  <TD>
                    <div class="flex flex-wrap gap-1.5">
                      <BaseTagChip v-for="c in i.contacts" :key="c.method">{{ INVITATION_METHOD_LABELS[c.method] }}</BaseTagChip>
                    </div>
                  </TD>
                  <TD><BaseStatusBadge :status="i.status" /></TD>
                  <TD class="text-muted-foreground text-xs">{{ formatDate(i.createdAt) }}</TD>
                  <TD class="text-muted-foreground text-xs">{{ formatDate(i.expiresAt) }}</TD>
                  <TD>
                    <Button size="sm" variant="ghost" :aria-label="`View details for ${i.firstName} ${i.lastName}`" @click="detailsOpen = i">View</Button>
                  </TD>
                </TRow>
              </tbody>
            </BaseTable>
          </div>
          <!-- Mobile: cards (same padding as table content) -->
          <div class="md:hidden divide-y divide-border/60">
            <div v-for="i in filteredRows" :key="i.id" class="py-4 space-y-3">
              <div class="flex items-start justify-between gap-2">
                <span class="font-medium text-foreground">{{ i.firstName }} {{ i.lastName }}</span>
                <BaseStatusBadge :status="i.status" />
              </div>
              <div class="flex items-center gap-1.5">
                <span class="font-mono text-xs text-foreground">{{ i.invitationCode }}</span>
                <button
                  type="button"
                  class="p-1 rounded hover:bg-muted text-muted-foreground"
                  aria-label="Copy code"
                  @click="copyCode(i.invitationCode)"
                >
                  <IconLucide name="copy" class="h-3.5 w-3.5" />
                </button>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <BaseTagChip v-for="c in i.contacts" :key="c.method">{{ INVITATION_METHOD_LABELS[c.method] }}</BaseTagChip>
              </div>
              <div class="flex justify-between text-xs text-muted-foreground pt-1">
                <span>{{ formatDate(i.createdAt) }}</span>
                <span>{{ formatDate(i.expiresAt) }}</span>
              </div>
              <Button size="sm" variant="ghost" class="w-full" @click="detailsOpen = i">Details</Button>
            </div>
          </div>
        </template>
    </BaseTableWrapper>

    <CreateInviteDialog
      :open="createOpen"
      :loading="false"
      @close="createOpen = false"
      @submit="onSubmitCreate"
    />

    <ConfirmInviteDialog
      :open="confirmOpen"
      :draft="store.draftInvite"
      :confirming="creating"
      @back="onConfirmBack"
      @confirm="onConfirmCreate"
    />

    <InviteCreatedDialog
      :open="!!successInvitation"
      :invitation="successInvitation"
      @close="successInvitation = null"
    />

    <Drawer
      :open="!!detailsOpen"
      :title="detailsOpen ? `Invite — ${detailsOpen.firstName} ${detailsOpen.lastName}` : ''"
      :on-close="() => (detailsOpen = null)"
    >
      <template v-if="detailsOpen">
        <div class="space-y-6">
          <!-- Name + Status + Code (what matters) -->
          <section class="space-y-3" aria-label="Invite summary">
            <div>
              <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</p>
              <p class="mt-0.5 text-base font-medium text-foreground">{{ detailsOpen.firstName }} {{ detailsOpen.lastName }}</p>
            </div>
            <div class="flex items-center gap-3">
              <div>
                <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</p>
                <p class="mt-0.5">
                  <BaseStatusBadge :status="detailsOpen.status" />
                </p>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Invitation code</p>
                <p class="mt-0.5 font-mono text-sm font-medium text-foreground" aria-label="Invitation code">{{ detailsOpen.invitationCode }}</p>
              </div>
            </div>
          </section>
          <!-- Contact methods (grouped) -->
          <section class="space-y-2" aria-label="Contact methods">
            <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Contact(s)</p>
            <div class="space-y-1.5">
              <div v-for="c in detailsOpen.contacts" :key="c.method" class="flex justify-between gap-4 text-sm">
                <span class="text-muted-foreground">{{ contactLabel(c.method) }}</span>
                <span class="text-foreground truncate">{{ c.value }}</span>
              </div>
            </div>
          </section>
          <!-- Metadata: Created + Expiry (secondary) -->
          <section class="space-y-2 pt-2 border-t border-border/60" aria-label="Dates">
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Created</span>
              <span class="text-foreground">{{ formatDateTime(detailsOpen.createdAt) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Expires</span>
              <span class="text-foreground">{{ formatDateTime(detailsOpen.expiresAt) }}</span>
            </div>
          </section>
        </div>
      </template>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { CreateInvitationPayload, Invitation, InvitationMethod } from "../../types";
import BaseTableWrapper from "../../components/ui/BaseTableWrapper.vue";
import BaseTable from "../../components/ui/BaseTable.vue";
import BaseTableHeader from "../../components/ui/BaseTableHeader.vue";
import Button from "../../components/ui/Button.vue";
import Input from "../../components/ui/Input.vue";
import Select from "../../components/ui/Select.vue";
import BaseStatusBadge from "../../components/ui/BaseStatusBadge.vue";
import BaseTagChip from "../../components/ui/BaseTagChip.vue";
import Skeleton from "../../components/ui/Skeleton.vue";
import TRow from "../../components/ui/TRow.vue";
import TH from "../../components/ui/TH.vue";
import TD from "../../components/ui/TD.vue";
import EmptyState from "../../components/ui/EmptyState.vue";
import IconLucide from "../../components/common/IconLucide.vue";
import Drawer from "../../components/ui/Drawer.vue";
import CreateInviteDialog from "../../components/invitations/CreateInviteDialog.vue";
import ConfirmInviteDialog from "../../components/invitations/ConfirmInviteDialog.vue";
import InviteCreatedDialog from "../../components/invitations/InviteCreatedDialog.vue";
import { useInvitationsStore } from "../../stores/invitations";
import { useToastStore } from "../../stores/toast";
import { copyToClipboard } from "../../utils/copyToClipboard";
import { INVITATION_METHOD_LABELS } from "../../constants/invitations";
import { generateInvitationCode } from "../../utils/invitationCode";
import { INVITATION_EXPIRY_DAYS } from "../../constants/invitations";

const store = useInvitationsStore();
const toast = useToastStore();
const createOpen = ref(false);
const confirmOpen = ref(false);
const detailsOpen = ref<Invitation | null>(null);
const successInvitation = ref<Invitation | null>(null);
const search = ref("");
const statusFilter = ref("");
const creating = ref(false);

const filteredRows = computed(() => {
  let list = store.invitations;
  const s = search.value.toLowerCase().trim();
  if (s) {
    list = list.filter(
      (i) =>
        i.firstName.toLowerCase().includes(s) ||
        i.lastName.toLowerCase().includes(s) ||
        i.contacts.some((c) => c.value.toLowerCase().includes(s))
    );
  }
  if (statusFilter.value) list = list.filter((i) => i.status === statusFilter.value);
  return list;
});

function formatContacts(contacts: Invitation["contacts"]): string {
  return contacts
    .map((c) => `${INVITATION_METHOD_LABELS[c.method]}: ${c.value}`)
    .join(", ");
}

function copyCode(code: string) {
  copyToClipboard(code, "Invitation code copied", toast);
}

function contactLabel(method: InvitationMethod): string {
  return INVITATION_METHOD_LABELS[method];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Form submit from CreateInviteDialog: validate passed, generate code, show confirmation. */
function onSubmitCreate(payload: Omit<CreateInvitationPayload, "invitationCode">) {
  const existingCodes = store.existingInvitationCodes;
  const invitationCode = generateInvitationCode(existingCodes);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  store.setDraft({
    firstName: payload.firstName,
    lastName: payload.lastName,
    contacts: payload.contacts,
    invitationCode,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });
  confirmOpen.value = true;
}

function onConfirmBack() {
  confirmOpen.value = false;
  store.clearDraft();
}

/** User confirmed: call POST /invitations with draft (including invitationCode). */
async function onConfirmCreate() {
  const draft = store.draftInvite;
  if (!draft) return;
  creating.value = true;
  try {
    const invitation = await store.createInvitation({
      firstName: draft.firstName,
      lastName: draft.lastName,
      contacts: draft.contacts,
      invitationCode: draft.invitationCode,
    });
    if (invitation) {
      confirmOpen.value = false;
      createOpen.value = false;
      successInvitation.value = invitation;
      store.clearDraft();
      toast.push({ title: "Invite created", message: "Invitation created successfully.", tone: "success" });
    } else {
      toast.push({ title: "Failed", message: store.error ?? "Could not create invite.", tone: "danger" });
    }
  } catch {
    toast.push({ title: "Failed", message: "Could not create invite.", tone: "danger" });
  } finally {
    creating.value = false;
  }
}

onMounted(() => {
  store.fetchInvitations();
});
</script>
