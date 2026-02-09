<template>
  <Modal
    :open="open && !!invitation"
    title="Invite created"
    :on-close="onClose"
    width-class="max-w-md"
  >
    <div v-if="invitation" class="space-y-5">
      <p class="text-sm text-foreground">Invitation created successfully.</p>

      <!-- Results only (no controls except Copy + Done) — grouped -->
      <div class="space-y-4">
        <section class="space-y-2" aria-label="Invite details">
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Name</span>
            <span class="font-medium text-foreground">{{ invitation.firstName }} {{ invitation.lastName }}</span>
          </div>
          <template v-for="c in invitation.contacts" :key="c.method">
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">{{ contactLabel(c.method) }}</span>
              <span class="text-foreground">{{ c.value }}</span>
            </div>
          </template>
          <div class="flex justify-between text-sm items-center">
            <span class="text-muted-foreground">Status</span>
            <BaseStatusBadge :status="invitation.status" />
          </div>
          <div class="flex justify-between text-sm text-muted-foreground">
            <span>Created</span>
            <span class="text-foreground">{{ formatDateTime(invitation.createdAt) }}</span>
          </div>
          <div class="flex justify-between text-sm text-muted-foreground">
            <span>Expires</span>
            <span class="text-foreground">{{ formatDateTime(invitation.expiresAt) }}</span>
          </div>
        </section>

        <!-- Code + Copy icon -->
        <section class="rounded-2xl border border-border bg-card/60 p-3 space-y-2" aria-label="Invitation code">
          <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Invitation code</p>
          <div class="flex items-center gap-2">
            <span class="font-mono text-sm font-semibold text-foreground">{{ invitation.invitationCode }}</span>
            <button
              type="button"
              class="p-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Copy invitation code"
              @click="copyCode"
            >
              <IconLucide name="copy" class="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import type { Invitation, InvitationMethod } from "../../types";
import BaseStatusBadge from "../ui/BaseStatusBadge.vue";
import IconLucide from "../common/IconLucide.vue";
import Modal from "../ui/Modal.vue";
import { useToastStore } from "../../stores/toast";
import { INVITATION_METHOD_LABELS } from "../../constants/invitations";

const props = defineProps<{ open: boolean; invitation: Invitation | null }>();
const emit = defineEmits<{ close: [] }>();
const toast = useToastStore();

function contactLabel(method: InvitationMethod): string {
  return INVITATION_METHOD_LABELS[method];
}

function copyCode() {
  if (!props.invitation?.invitationCode) return;
  navigator.clipboard.writeText(props.invitation.invitationCode).then(
    () => toast.push({ title: "Copied", message: "Invitation code copied.", tone: "success" }),
    () => toast.push({ title: "Copy failed", message: "Please copy manually.", tone: "danger" })
  );
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function onClose() {
  emit("close");
}
</script>
