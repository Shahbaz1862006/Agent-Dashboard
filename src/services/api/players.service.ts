/**
 * Players API service. Used when VITE_USE_MOCK_API is false.
 */

import type { Player } from "../../types";
import type { PlayerActionPayload } from "../api";
import { get, post } from "./http.client";

const BASE = "/api/players";

export const playersService = {
  getPlayers(): Promise<Player[]> {
    return get<Player[]>(BASE);
  },
  getPlayer(id: string): Promise<Player | null> {
    return get<Player | null>(`${BASE}/${encodeURIComponent(id)}`);
  },
  suspendPlayer(id: string, payload: PlayerActionPayload): Promise<Player> {
    return post<Player>(`${BASE}/${encodeURIComponent(id)}/suspend`, payload);
  },
  reactivatePlayer(id: string, payload: PlayerActionPayload): Promise<Player> {
    return post<Player>(`${BASE}/${encodeURIComponent(id)}/reactivate`, payload);
  },
  restrictPlayer(id: string, payload: PlayerActionPayload): Promise<Player> {
    return post<Player>(`${BASE}/${encodeURIComponent(id)}/restrict`, payload);
  },
  unrestrictPlayer(id: string, payload: PlayerActionPayload): Promise<Player> {
    return post<Player>(`${BASE}/${encodeURIComponent(id)}/unrestrict`, payload);
  },
};
