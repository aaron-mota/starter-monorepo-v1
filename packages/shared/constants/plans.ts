export const PLAN_LIMITS = {
  free: {
    maxItems: 10,
    maxTeamMembers: 3,
    historyDays: 30 as number | null,
    exportEnabled: false,
    notificationsEnabled: true,
    advancedAnalytics: false,
  },
  pro: {
    maxItems: 100,
    maxTeamMembers: 20,
    historyDays: null as number | null,
    exportEnabled: true,
    notificationsEnabled: true,
    advancedAnalytics: true,
  },
} as const;

export type PlanTier = keyof typeof PLAN_LIMITS;
