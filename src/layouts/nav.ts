/**
 * Sidebar nav items. Icon names are Lucide (via IconLucide; one icon set only).
 * Every item has exactly one icon; size and style are consistent in Sidebar.vue.
 */
export const SIDEBAR_ICON_SIZE = "h-5 w-5";

export const navItems: { to: string; label: string; icon: string }[] = [
  { to: "/dashboard/home", label: "Home", icon: "layout-dashboard" },
  { to: "/dashboard/wallet", label: "Wallet", icon: "wallet" },
  { to: "/dashboard/players", label: "Players", icon: "users" },
  { to: "/dashboard/invites", label: "Invites", icon: "send" },
  { to: "/dashboard/payouts", label: "Payouts", icon: "receipt-text" },
  { to: "/dashboard/commissions", label: "Commissions", icon: "shield" },
  { to: "/dashboard/clan/goals", label: "Clan Goals", icon: "target" },
  { to: "/dashboard/clan/wars", label: "Clan Wars", icon: "swords" },
  { to: "/dashboard/settings", label: "Settings", icon: "settings" },
];
