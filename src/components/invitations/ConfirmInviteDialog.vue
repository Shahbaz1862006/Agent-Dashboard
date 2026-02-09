<template>
  <Modal
    :open="open && !!draft"
    title="Confirm Invite"
    :on-close="onBack"
    width-class="max-w-md"
  >
    <div v-if="draft" class="space-y-5">
      <p class="text-sm text-foreground">
        Are you sure you want to create invite for <strong>{{ draft.firstName }} {{ draft.lastName }}</strong>?
      </p>

      <!-- Summary card: full name, methods + values, expiry, code -->
      <div class="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-muted-foreground">Full name</span>
          <span class="font-medium text-foreground">{{ draft.firstName }} {{ draft.lastName }}</span>
        </div>
        <template v-for="c in draft.contacts" :key="c.method">
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">{{ contactLabel(c.method) }}</span>
            <span class="text-foreground">{{ c.value }}</span>
          </div>
        </template>
        <div class="flex justify-between text-sm">
          <span class="text-muted-foreground">Expiry</span>
          <span class="text-foreground">7 days</span>
        </div>
        <div class="pt-2 border-t border-border/60">
          <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Invitation code</p>
          <div class="flex items-center gap-2">
            <span class="font-mono text-sm font-semibold text-foreground">{{ draft.invitationCode }}</span>
            <button
              type="button"
              class="p-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Copy invitation code"
              @click="copyCode"
            >
              <IconLucide name="copy" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-1">
        <Button variant="ghost" type="button" :disabled="confirming" @click="onBack">Back</Button>
        <Button variant="primary" type="button" :loading="confirming" @click="onConfirm">
          {{ confirming ? "Creating…" : "Confirm & Create" }}
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import type { InvitationDraft, InvitationMethod } from "../../types";
import Button from "../ui/Button.vue";
import IconLucide from "../common/IconLucide.vue";
import Modal from "../ui/Modal.vue";
import { INVITATION_METHOD_LABELS } from "../../constants/invitations";
import { useToastStore } from "../../stores/toast";

const props = defineProps<{ open: boolean; draft: InvitationDraft | null; confirming?: boolean }>();
const emit = defineEmits<{ back: []; confirm: [] }>();
const toast = useToastStore();

function contactLabel(method: InvitationMethod): string {
  return INVITATION_METHOD_LABELS[method];
}

function onBack() {
  emit("back");
}

function onConfirm() {
  emit("confirm");
}

function copyCode() {
  if (!props.draft?.invitationCode) return;
  navigator.clipboard.writeText(props.draft.invitationCode).then(
    () => toast.push({ title: "Copied", message: "Invitation code copied.", tone: "success" }),
    () => toast.push({ title: "Copy failed", message: "Please copy manually.", tone: "danger" })
  );
}
</script>
