/**
 * Action guard – use in templates and scripts to check permission before showing/doing an action.
 * Example: v-if="can('create_invite')" or if (can('reclaim_credit')) { ... }
 */

import { usePermissionStore } from "../stores/permission";
import type { Permission } from "../stores/permission";

export function useCan() {
  const permissionStore = usePermissionStore();
  return (p: Permission) => permissionStore.can(p);
}

export function useCanPermission(perm: Permission) {
  const permissionStore = usePermissionStore();
  return permissionStore.can(perm);
}
