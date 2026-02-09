/**
 * Real API layer. Composes domain services into the full Api interface.
 * Used when VITE_USE_MOCK_API is false.
 */

import type { Api } from "../api";
import { agentService } from "./agent.service";
import { invitationsService } from "./invitations.service";
import { payoutsService } from "./payouts.service";
import { playersService } from "./players.service";

export function createApi(): Api {
  return {
    getWalletSummary: () => agentService.getWalletSummary(),
    requestWithdrawal: (payload) => agentService.requestWithdrawal(payload),
    getLedger: () => agentService.getLedger(),
    getPlayers: () => playersService.getPlayers(),
    getPlayer: (id) => playersService.getPlayer(id),
    suspendPlayer: (id, payload) => playersService.suspendPlayer(id, payload),
    reactivatePlayer: (id, payload) => playersService.reactivatePlayer(id, payload),
    restrictPlayer: (id, payload) => playersService.restrictPlayer(id, payload),
    unrestrictPlayer: (id, payload) => playersService.unrestrictPlayer(id, payload),
    getInvites: () => agentService.getInvites(),
    createInvite: (input) => agentService.createInvite(input),
    resendInvite: (id) => agentService.resendInvite(id),
    getInvitations: () => invitationsService.getInvitations(),
    createInvitation: (payload) => invitationsService.createInvitation(payload),
    getPayouts: () => payoutsService.getPayouts(),
    approvePayout: (id) => payoutsService.approvePayout(id),
    declinePayout: (id, reason) => payoutsService.declinePayout(id, reason),
    escalatePayout: (id, payload) => payoutsService.escalatePayout(id, payload),
    getPlayerDepositsSummary: () => agentService.getPlayerDepositsSummary(),
    getStatements: () => agentService.getStatements(),
    getStatement: (id) => agentService.getStatement(id),
    getGoals: () => agentService.getGoals(),
    getWars: () => agentService.getWars(),
    registerWar: (id) => agentService.registerWar(id),
    getAlerts: () => agentService.getAlerts(),
  };
}

export { authService } from "./auth.service";
export { agentService } from "./agent.service";
export { invitationsService } from "./invitations.service";
export { playersService } from "./players.service";
export { payoutsService } from "./payouts.service";
export { get, post, request } from "./http.client";
