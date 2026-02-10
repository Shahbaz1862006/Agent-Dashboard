<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-lg font-semibold">Settings</h1>
      <p class="mt-1 text-sm text-muted-foreground">Security and session preferences.</p>
    </div>

    <Card>
      <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
      <CardContent class="space-y-3">
        <div class="rounded-xl border border-border bg-card/60 p-4 space-y-2">
          <div class="flex items-center justify-between">
            <div class="text-xs text-muted-foreground">Agent</div>
            <BaseStatusBadge status="Active" />
          </div>
          <div class="text-lg font-semibold text-foreground">{{ agent.name }}</div>
          <div class="text-sm text-muted-foreground">{{ agent.email }}</div>
            <div class="grid grid-cols-1 gap-1 pt-2 border-t border-border text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Agent ID</span>
              <span class="font-medium text-foreground">{{ agent.agentId }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Clan</span>
              <span class="font-medium text-foreground">{{ agent.clanName }}</span>
            </div>
          </div>
        </div>
        <Button variant="secondary" @click="toast.push({ title: 'Profile locked', message: 'Changes require admin approval.', tone: 'info' })">
          Request profile change
        </Button>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle>Two-Factor Authentication</CardTitle></CardHeader>
      <CardContent class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="text-sm text-foreground font-medium">2FA status</div>
          <BaseStatusBadge :status="twoFaEnabled ? 'Enabled' : 'Disabled'" />
        </div>

        <template v-if="twoFaEnabled">
          <div class="rounded-xl border border-border bg-card/60 p-4">
            <div class="text-xs text-muted-foreground">Authenticator</div>
            <div class="mt-1 text-sm text-foreground">Active device linked</div>
            <Button class="mt-3" size="sm" variant="secondary" @click="disable2Fa">Disable 2FA</Button>
          </div>
        </template>
        <template v-else>
          <div class="space-y-2">
            <div class="rounded-xl border border-border bg-card/60 p-4">
              <div class="text-sm font-semibold">Enable 2FA</div>
              <p class="mt-1 text-sm text-muted-foreground">Scan the QR with an authenticator app, then enter the 6-digit code.</p>
              <div class="mt-3 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                QR Placeholder • otpauth://totp/Clazino:agent?secret=MOCKSECRET
              </div>
            </div>
            <div>
              <label class="text-xs text-muted-foreground">6-digit code</label>
              <Input v-model="otp" placeholder="123456" class="mt-1 max-w-[140px]" />
            </div>
            <Button variant="primary" @click="enable2Fa">Verify & Enable</Button>
          </div>
        </template>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle>Sessions</CardTitle></CardHeader>
      <CardContent class="space-y-3">
        <p class="text-sm text-muted-foreground">Manage your active sessions. Log out others to revoke access from other devices.</p>
        <div class="rounded-xl border border-border bg-card/60 p-4 flex items-center justify-between gap-4">
          <div>
            <div class="text-sm font-semibold text-foreground">{{ currentSession.browser }} • {{ currentSession.device }}</div>
            <div class="mt-0.5 text-xs text-muted-foreground">Location: {{ currentSession.location }}</div>
            <div class="mt-0.5 text-xs text-muted-foreground">Last active: {{ formatDateTime(currentSession.lastActive) }}</div>
          </div>
          <Badge tone="info">Current session</Badge>
        </div>
        <div class="flex gap-2 pt-2">
          <Button variant="secondary" @click="toast.push({ title: 'Other sessions cleared', message: 'All other sessions revoked (mock).', tone: 'info' })">
            Log out other sessions
          </Button>
          <Button variant="ghost" @click="auth.logout">Logout</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Card from "../../components/ui/Card.vue";
import CardHeader from "../../components/ui/CardHeader.vue";
import CardTitle from "../../components/ui/CardTitle.vue";
import CardContent from "../../components/ui/CardContent.vue";
import Button from "../../components/ui/Button.vue";
import Input from "../../components/ui/Input.vue";
import BaseStatusBadge from "../../components/ui/BaseStatusBadge.vue";
import BaseTagChip from "../../components/ui/BaseTagChip.vue";
import { useAuthStore } from "../../stores/auth";
import { useToastStore } from "../../stores/toast";
import { AGENT_PERSONA } from "../../data/agentPersona";

const auth = useAuthStore();
const toast = useToastStore();
const agent = computed(() => ({
  ...AGENT_PERSONA,
  name: auth.user?.name ?? AGENT_PERSONA.name,
  email: auth.user?.email ?? AGENT_PERSONA.email,
}));
const currentSession = computed(() => AGENT_PERSONA.sessions.find((s) => s.current) ?? AGENT_PERSONA.sessions[0]);
const twoFaEnabled = ref<boolean>(AGENT_PERSONA.twoFaEnabled);
const otp = ref("");

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function disable2Fa() {
  twoFaEnabled.value = false;
  toast.push({ title: "2FA disabled", message: "Disabled in mock mode.", tone: "warning" });
}

function enable2Fa() {
  twoFaEnabled.value = true;
  toast.push({ title: "2FA enabled", message: "Enabled in mock mode.", tone: "success" });
  otp.value = "";
}
</script>
