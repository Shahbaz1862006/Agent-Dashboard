<template>
  <Teleport to="body">
    <div v-if="mobileOpen" class="fixed inset-0 z-50">
      <div
        class="fixed inset-0 z-50 bg-black/40 animate-in fade-in-0"
        @click="emit('update:mobileOpen', false)"
      />
      <div
        class="fixed left-0 top-0 z-50 h-full w-80 max-w-[92vw] border-r border-border bg-card text-card-foreground shadow-panel animate-in slide-in-from-left overflow-hidden flex flex-col"
      >
        <div class="flex h-full flex-col min-h-0">
          <div class="px-5 py-5 border-b border-border flex-shrink-0">
            <button type="button" class="text-left flex items-center justify-center md:justify-start" @click="goHome(); emit('update:mobileOpen', false)">
              <Logo logo-only />
            </button>
          </div>
          <nav class="px-3 py-3">
            <router-link
              v-for="it in navItems"
              :key="it.to"
              :to="it.to"
              class="sidebar-nav-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors duration-200 ease-out transition-transform duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:bg-muted focus-visible:text-foreground active:scale-[0.99] active:opacity-[0.98]"
              :class="{ 'bg-muted text-foreground border border-border': isActive(it.to) }"
              @click="emit('update:mobileOpen', false)"
            >
              <IconLucide :name="it.icon" :className="cn(SIDEBAR_ICON_SIZE, 'shrink-0 opacity-90')" />
              <span>{{ it.label }}</span>
            </router-link>
          </nav>
          <div class="mt-auto px-5 py-4 border-t border-border">
            <div class="text-xs text-muted-foreground">Signed in as</div>
            <div class="mt-1 text-sm font-medium">{{ userName ?? "Agent" }}</div>
            <div class="mt-0.5 text-xs text-muted-foreground">{{ clanName ?? "Clan" }}</div>
            <div class="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" class="flex items-center gap-2" @click="goSettings(); emit('update:mobileOpen', false)">
                <IconLucide name="settings" :className="cn(SIDEBAR_ICON_SIZE, 'shrink-0')" />
                Settings
              </Button>
              <Button size="sm" variant="ghost" class="flex items-center gap-2" @click="emit('update:mobileOpen', false); onLogout()">
                <IconLucide name="log-out" :className="cn(SIDEBAR_ICON_SIZE, 'shrink-0')" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Sidebar: expand/collapse ONLY via navbar hamburger; hover does NOT expand -->
  <aside
    :class="cn(
      'hidden md:flex fixed left-0 top-0 z-30 h-screen flex-col border-r border-border bg-card/60 overflow-hidden',
      sidebarWidthClass
    )"
  >
    <div class="flex flex-col min-h-0 flex-1">
      <div :class="cn('px-4 py-5 flex-shrink-0', collapsed && 'px-3')">
        <button type="button" :class="cn('w-full flex items-center', collapsed && 'justify-center')" @click="goHome()">
          <Logo :compact="collapsed" logo-only :class="cn(collapsed && 'justify-center')" />
        </button>
      </div>
      <nav :class="cn('px-2 pb-4 flex-shrink-0 min-h-0', collapsed && 'px-2')">
      <router-link
        v-for="it in navItems"
        :key="it.to"
        :to="it.to"
        :title="collapsed ? it.label : undefined"
        :class="cn(
          'sidebar-nav-link flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors duration-200 ease-out transition-transform duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:bg-muted focus-visible:text-foreground active:scale-[0.99] active:opacity-[0.98]',
          isActive(it.to) && 'bg-muted text-foreground border border-border',
          collapsed && 'justify-center px-0'
        )"
      >
        <IconLucide :name="it.icon" :className="cn(SIDEBAR_ICON_SIZE, 'shrink-0 opacity-90')" />
        <span :class="cn('whitespace-nowrap', collapsed && 'hidden')">{{ it.label }}</span>
      </router-link>
      </nav>
      <div class="mt-auto px-4 py-4 border-t border-border flex-shrink-0">
        <div :class="cn('text-xs text-muted-foreground', collapsed && 'hidden')">Signed in as</div>
        <div :class="cn('mt-1 text-sm font-medium', collapsed && 'hidden')">{{ userName ?? "Agent" }}</div>
        <div :class="cn('mt-0.5 text-xs text-muted-foreground', collapsed && 'hidden')">{{ clanName ?? "Clan" }}</div>
        <div class="mt-3 flex gap-2">
          <template v-if="collapsed">
            <Button size="icon" variant="secondary" :title="'Settings'" @click="goSettings()">
              <IconLucide name="settings" :className="cn(SIDEBAR_ICON_SIZE, 'shrink-0')" />
            </Button>
            <Button size="icon" variant="ghost" title="Logout" @click="onLogout()">
              <IconLucide name="log-out" :className="cn(SIDEBAR_ICON_SIZE, 'shrink-0')" />
            </Button>
          </template>
          <template v-else>
            <Button size="sm" variant="secondary" class="flex items-center gap-2" @click="goSettings()">
              <IconLucide name="settings" :className="cn(SIDEBAR_ICON_SIZE, 'shrink-0')" />
              Settings
            </Button>
            <Button size="sm" variant="ghost" class="flex items-center gap-2" @click="onLogout()">
              <IconLucide name="log-out" :className="cn(SIDEBAR_ICON_SIZE, 'shrink-0')" />
              Logout
            </Button>
          </template>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { cn } from "../utils/cn";
import { navItems, SIDEBAR_ICON_SIZE } from "./nav";
import Logo from "../components/common/Logo.vue";
import IconLucide from "../components/common/IconLucide.vue";
import Button from "../components/ui/Button.vue";

const props = defineProps<{
  userName?: string;
  clanName?: string;
  collapsed: boolean;
  mobileOpen: boolean;
  onLogout: () => void;
}>();

const emit = defineEmits<{ "update:mobileOpen": [v: boolean] }>();

const router = useRouter();
const route = useRoute();

const sidebarWidthClass = computed(() => (props.collapsed ? "w-16" : "w-72"));

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + "/");
}
function goHome() {
  router.push("/dashboard/home");
}
function goSettings() {
  router.push("/dashboard/settings");
}
</script>

<style scoped>
/* Icon inherits link color so hover/active update icon + label together */
.sidebar-nav-link :deep(svg) {
  color: currentColor;
}

/* Active item hover: very minimal elevation, no layout shift */
.sidebar-nav-link.router-link-active:hover {
  filter: brightness(1.02);
}
</style>
