/**
 * Mock players API. Returns Promises with latency; matches real API response structures.
 */

import type { Player } from "../../types";
import type { PlayerActionPayload } from "../api";
import * as state from "./state";
import { delay } from "./delay";

export const playersMock = {
  async getPlayers() {
    await delay(350);
    return state.players;
  },

  async getPlayer(id: string) {
    await delay(250);
    return state.players.find((p) => p.id === id) ?? null;
  },

  async suspendPlayer(id: string, payload: PlayerActionPayload): Promise<Player> {
    await delay(400);
    const idx = state.players.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Player not found");
    const next: Player = {
      ...state.players[idx],
      status: "Suspended",
      lastStatusChangeReason: payload.reason,
      lastStatusChangedAt: payload.actedAt,
      lastStatusChangedBy: payload.actedBy,
    };
    state.setPlayers(state.players.map((p, i) => (i === idx ? next : p)));
    return next;
  },

  async reactivatePlayer(id: string, payload: PlayerActionPayload): Promise<Player> {
    await delay(400);
    const idx = state.players.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Player not found");
    const next: Player = {
      ...state.players[idx],
      status: "Active",
      lastStatusChangeReason: payload.reason,
      lastStatusChangedAt: payload.actedAt,
      lastStatusChangedBy: payload.actedBy,
    };
    state.setPlayers(state.players.map((p, i) => (i === idx ? next : p)));
    return next;
  },

  async restrictPlayer(id: string, payload: PlayerActionPayload): Promise<Player> {
    await delay(400);
    const idx = state.players.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Player not found");
    const next: Player = {
      ...state.players[idx],
      status: "Restricted",
      lastStatusChangeReason: payload.reason,
      lastStatusChangedAt: payload.actedAt,
      lastStatusChangedBy: payload.actedBy,
    };
    state.setPlayers(state.players.map((p, i) => (i === idx ? next : p)));
    return next;
  },

  async unrestrictPlayer(id: string, payload: PlayerActionPayload): Promise<Player> {
    await delay(400);
    const idx = state.players.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Player not found");
    const next: Player = {
      ...state.players[idx],
      status: "Active",
      lastStatusChangeReason: payload.reason,
      lastStatusChangedAt: payload.actedAt,
      lastStatusChangedBy: payload.actedBy,
    };
    state.setPlayers(state.players.map((p, i) => (i === idx ? next : p)));
    return next;
  },
};
