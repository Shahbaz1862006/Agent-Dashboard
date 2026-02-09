import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", redirect: "/invite" },
    { path: "/invite", name: "InviteEntry", component: () => import("../pages/auth/InviteEntryPage.vue") },
    { path: "/login", name: "Login", component: () => import("../pages/auth/LoginPage.vue") },
    { path: "/register", name: "Register", component: () => import("../pages/auth/RegisterPage.vue") },
    { path: "/auth/login", redirect: "/login" },
    { path: "/auth/register", redirect: "/register" },
    {
      path: "/dashboard",
      component: () => import("../layouts/DashboardLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        { path: "", redirect: "/dashboard/home" },
        { path: "home", name: "Home", component: () => import("../pages/dashboard/HomePage.vue") },
        { path: "wallet", name: "Wallet", component: () => import("../pages/dashboard/WalletPage.vue") },
        { path: "players", name: "Players", component: () => import("../pages/dashboard/PlayersPage.vue") },
        { path: "players/:playerId", name: "PlayerDetail", component: () => import("../pages/dashboard/PlayerDetailPage.vue") },
        { path: "invites", name: "Invites", component: () => import("../pages/dashboard/InvitesPage.vue") },
        { path: "payouts", name: "Payouts", component: () => import("../pages/dashboard/PayoutsPage.vue") },
        { path: "commissions", name: "Commissions", component: () => import("../pages/dashboard/CommissionsPage.vue") },
        { path: "commissions/statements/:statementId", name: "StatementDetail", component: () => import("../pages/dashboard/StatementDetailPage.vue") },
        { path: "clan", name: "ClanOverview", component: () => import("../pages/dashboard/ClanOverviewPage.vue") },
        { path: "clan/goals", name: "ClanGoals", component: () => import("../pages/dashboard/ClanGoalsPage.vue") },
        { path: "clan/wars", name: "ClanWars", component: () => import("../pages/dashboard/ClanWarsPage.vue") },
        { path: "clan/wars/:warId", name: "WarDetail", component: () => import("../pages/dashboard/WarDetailPage.vue") },
        { path: "settings", name: "Settings", component: () => import("../pages/dashboard/SettingsPage.vue") },
      ],
    },
    { path: "/404", name: "NotFound", component: () => import("../pages/misc/NotFoundPage.vue") },
    { path: "/:pathMatch(.*)*", redirect: "/404" },
  ],
});

router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore();
    if (!auth.token) {
      next({ path: "/login", query: { redirect: to.fullPath } });
      return;
    }
    if (auth.isExpired) {
      auth.logout();
      next({ path: "/login", query: { redirect: to.fullPath } });
      return;
    }
  }
  next();
});

export default router;
