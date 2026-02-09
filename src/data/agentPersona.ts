/**
 * Fake agent persona for demo – consistent across the dashboard.
 */
export const AGENT_PERSONA = {
  id: "agent_user_01",
  name: "Shahbaz Khan",
  email: "shahbazkhan1862006@gmail.com",
  agentId: "agent_001",
  clanName: "Clazino Clan Alpha",
  joinDate: "2024-06-15",
  region: "Pakistan (PK)",
  tier: "Tier 2",
  commissionRate: "3.5%",
  totalPlayers: 55,
  invitesRemaining: 8,
  invitesTotal: 50,
  invitesResetAt: "01/02/2026",
  totalVolume30d: 124_500,
  totalCommissionYtd: 4_280,
  twoFaEnabled: true,
  sessions: [
    { id: "s1", browser: "Chrome", device: "Web", location: "Pakistan (PK)", lastActive: "2026-02-03T14:00:00Z", current: true },
    { id: "s2", browser: "Safari", device: "Mobile", location: "Pakistan (PK)", lastActive: "2026-02-02T09:30:00Z", current: false },
    { id: "s3", browser: "Firefox", device: "Web", location: "UAE (AE)", lastActive: "2026-01-28T18:00:00Z", current: false },
  ],
} as const;
