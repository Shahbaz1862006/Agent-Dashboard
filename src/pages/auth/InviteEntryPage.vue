<template>
  <div class="min-h-screen bg-background text-foreground flex items-center justify-center p-5">
    <div class="fixed right-4 top-4">
      <ThemeToggle />
    </div>

    <Card class="w-full max-w-lg">
      <CardHeader>
        <div class="flex flex-col items-center text-center">
          <Logo logoOnly class="justify-center" />
          <div class="mt-4">
            <CardTitle>Enter Invitation Code</CardTitle>
            <p class="mt-1 text-sm text-muted-foreground">
              Use the invite code sent by Admin to continue.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <div>
          <label class="text-xs text-muted-foreground">Invite Code</label>
          <Input
            v-model="code"
            placeholder="e.g. CLZ-AGENT-2026"
            autocomplete="off"
          />
          <p v-if="inlineError" class="mt-1 text-xs text-warning">{{ inlineError }}</p>
        </div>

        <Button class="w-full" variant="primary" :disabled="loading" @click="onVerify">
          {{ loading ? "Verifying…" : "Verify Code" }}
        </Button>

        <div class="text-xs text-muted-foreground text-center">
          Already have an account? <router-link class="underline" to="/login">Sign in</router-link>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import Card from "../../components/ui/Card.vue";
import CardHeader from "../../components/ui/CardHeader.vue";
import CardTitle from "../../components/ui/CardTitle.vue";
import CardContent from "../../components/ui/CardContent.vue";
import Input from "../../components/ui/Input.vue";
import Button from "../../components/ui/Button.vue";
import Logo from "../../components/common/Logo.vue";
import ThemeToggle from "../../components/common/ThemeToggle.vue";
import { useToastStore } from "../../stores/toast";

const LS_INVITE = "clazino_invite";

const MOCK_INVITES: Record<string, { email?: string; expiresAt: string; used?: boolean }> = {
  "CLZ-AGENT-2026": { email: "agent@example.com", expiresAt: "2027-01-01T00:00:00.000Z" },
  "BETA-123456": { expiresAt: "2027-01-01T00:00:00.000Z" },
  "VIP-PAK-900": { expiresAt: "2027-01-01T00:00:00.000Z" },
};

type InviteResult =
  | { ok: true; meta: { code: string; email?: string; expiresAt: string } }
  | { ok: false; reason: "invalid" | "expired" | "used" };

function verifyInvite(codeRaw: string): Promise<InviteResult> {
  const code = codeRaw.trim().toUpperCase();
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const found = MOCK_INVITES[code];
      if (!found) return resolve({ ok: false, reason: "invalid" });
      if (found.used) return resolve({ ok: false, reason: "used" });
      if (new Date(found.expiresAt).getTime() < Date.now()) return resolve({ ok: false, reason: "expired" });
      return resolve({ ok: true, meta: { code, email: found.email, expiresAt: found.expiresAt } });
    }, 650);
  });
}

const router = useRouter();
const toast = useToastStore();
const code = ref("");
const loading = ref(false);
const inlineError = ref<string | null>(null);

async function onVerify() {
  const trimmed = code.value.trim();
  if (!trimmed) {
    inlineError.value = "Invitation code required.";
    return;
  }
  if (trimmed.length < 6) {
    inlineError.value = "Invitation code required.";
    return;
  }
  inlineError.value = null;
  loading.value = true;
  const res = await verifyInvite(trimmed);
  loading.value = false;

  if (!res.ok) {
    const msg =
      res.reason === "expired"
        ? "Invite expired. Request a new one from Admin."
        : res.reason === "used"
        ? "Invite already used. Sign in instead."
        : "Invalid invite code.";
    toast.push({ title: "Verification failed", message: msg, tone: "warning" });
    inlineError.value = msg;
    return;
  }

  localStorage.setItem(LS_INVITE, JSON.stringify({ inviteVerified: true, inviteMeta: res.meta }));
  toast.push({ title: "Invite verified", message: "Continue to registration.", tone: "success" });
  await router.replace("/register");
}
</script>
