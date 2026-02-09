<template>
  <div class="min-h-screen bg-background text-foreground">
    <div class="flex">
      <Sidebar
        :user-name="auth.user?.email ?? auth.user?.name"
        :clan-name="auth.user?.clanName"
        :collapsed="collapsed"
        v-model:mobile-open="mobileOpen"
        :on-logout="auth.logout"
      />
      <!-- Spacer so main content is not under the fixed sidebar; only main scrolls -->
      <div
        :class="['hidden md:block flex-shrink-0', collapsed ? 'w-16' : 'w-72']"
        aria-hidden="true"
      />

      <main class="flex-1 min-w-0">
        <header class="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
          <div class="mx-auto max-w-[1400px] px-5 py-4 flex items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <div class="md:hidden">
                <Button size="icon" variant="ghost" @click="mobileOpen = true" aria-label="Open sidebar" title="Open sidebar">
                  <IconLucide name="menu" class="h-4 w-4" />
                </Button>
              </div>
              <div class="hidden md:block">
                <Button size="icon" variant="ghost" @click="collapsed = !collapsed" aria-label="Toggle sidebar" :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'">
                  <IconLucide name="menu" class="h-4 w-4" />
                </Button>
              </div>
              <div>
                <div class="text-xs text-muted-foreground">Agent</div>
                <div class="text-sm font-semibold">{{ auth.user?.clanName ?? "Clan" }}</div>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <ThemeToggle />
              <Button size="sm" variant="secondary" @click="router.push('/dashboard/invites')">Invite Player</Button>
              <Button size="sm" variant="secondary" @click="router.push('/dashboard/wallet')">Deposit USDT</Button>
            </div>
          </div>
        </header>
        <div class="mx-auto max-w-[1400px] px-5 py-6">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import IconLucide from "../components/common/IconLucide.vue";
import { useAuthStore } from "../stores/auth";
import Sidebar from "./Sidebar.vue";
import Button from "../components/ui/Button.vue";
import ThemeToggle from "../components/common/ThemeToggle.vue";

const STORAGE_KEY = "clazino_sidebar_collapsed";

const auth = useAuthStore();
const router = useRouter();

const collapsed = ref(localStorage.getItem(STORAGE_KEY) === "1");
const mobileOpen = ref(false);

watch(collapsed, (val) => {
  localStorage.setItem(STORAGE_KEY, val ? "1" : "0");
});
</script>
