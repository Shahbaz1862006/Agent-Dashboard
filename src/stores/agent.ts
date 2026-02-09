/**
 * Agent store – profile, quotas, and agent-scoped data.
 * Used for permission checks and UI that depends on agent identity.
 */

import { defineStore } from "pinia";
import { computed } from "vue";
import { useAuthStore } from "./auth";
import { AGENT_PERSONA } from "../data/agentPersona";

export const useAgentStore = defineStore("agent", () => {
  const auth = useAuthStore();

  const profile = computed(() => {
    if (!auth.user) return null;
    return {
      id: auth.user.id,
      name: auth.user.name,
      email: auth.user.email,
      agentId: auth.user.agentId,
      clanName: auth.user.clanName,
      joinDate: AGENT_PERSONA.joinDate,
      region: AGENT_PERSONA.region,
      tier: AGENT_PERSONA.tier,
      commissionRate: AGENT_PERSONA.commissionRate,
      invitesRemaining: AGENT_PERSONA.invitesRemaining,
      invitesTotal: AGENT_PERSONA.invitesTotal,
      invitesResetAt: AGENT_PERSONA.invitesResetAt,
    };
  });

  const invitesQuota = computed(() => ({
    remaining: AGENT_PERSONA.invitesRemaining,
    total: AGENT_PERSONA.invitesTotal,
    resetAt: AGENT_PERSONA.invitesResetAt,
  }));

  function reset() {
    // No local state; profile derived from auth.
  }

  return { profile, invitesQuota, reset };
});
