/**
 * Mock API layer. Composes domain mocks into the full Api interface.
 * Used when VITE_USE_MOCK_API is true.
 * All methods return Promises, simulate latency, and match real API response structures.
 */

import type { Api } from "../api";
import { agentMock } from "./agent.mock";
import { invitationsMock } from "./invitations.mock";
import { payoutsMock } from "./payouts.mock";
import { playersMock } from "./players.mock";

export function createMockApi(): Api {
  return {
    getWalletSummary: () => agentMock.getWalletSummary(),
    creditAgentDeposit: (amount) => agentMock.creditAgentDeposit(amount),
    requestWithdrawal: (payload) => agentMock.requestWithdrawal(payload),
    getLedger: () => agentMock.getLedger(),
    getPlayers: () => playersMock.getPlayers(),
    getPlayer: (id) => playersMock.getPlayer(id),
    suspendPlayer: (id, payload) => playersMock.suspendPlayer(id, payload),
    reactivatePlayer: (id, payload) => playersMock.reactivatePlayer(id, payload),
    restrictPlayer: (id, payload) => playersMock.restrictPlayer(id, payload),
    unrestrictPlayer: (id, payload) => playersMock.unrestrictPlayer(id, payload),
    getInvites: () => agentMock.getInvites(),
    createInvite: (input) => agentMock.createInvite(input),
    resendInvite: (id) => agentMock.resendInvite(id),
    getInvitations: () => invitationsMock.getInvitations(),
    createInvitation: (payload) => invitationsMock.createInvitation(payload),
    getPayouts: () => payoutsMock.getPayouts(),
    approvePayout: (id) => payoutsMock.approvePayout(id),
    declinePayout: (id, reason) => payoutsMock.declinePayout(id, reason),
    escalatePayout: (id, payload) => payoutsMock.escalatePayout(id, payload),
    getPlayerDepositsSummary: () => agentMock.getPlayerDepositsSummary(),
    getStatements: () => agentMock.getStatements(),
    getStatement: (id) => agentMock.getStatement(id),
    getGoals: () => agentMock.getGoals(),
    getWars: () => agentMock.getWars(),
    registerWar: (id) => agentMock.registerWar(id),
    getAlerts: () => agentMock.getAlerts(),
  };
}

export { authMock } from "./auth.mock";
export { agentMock } from "./agent.mock";
export { invitationsMock } from "./invitations.mock";
export { playersMock } from "./players.mock";
export { payoutsMock } from "./payouts.mock";
