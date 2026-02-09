/**
 * Homepage Row 2 charts: Deposits vs Withdrawals + GGR Trends.
 * Data from mock service; replace with API in fetchHomepageCharts when ready.
 */

import { defineStore } from "pinia";
import { fetchHomepageChartsData } from "../services/mockHomepageCharts";
import type { DepositsWithdrawalsPoint, GgrPoint } from "../services/mockHomepageCharts";

export type ChartRange = "7d" | "14d" | "30d";

function rangeToDays(range: ChartRange): number {
  return range === "7d" ? 7 : range === "14d" ? 14 : 30;
}

export const useHomepageAnalyticsStore = defineStore("homepageAnalytics", {
  state: (): {
    depositsWithdrawalsSeries: DepositsWithdrawalsPoint[];
    ggrSeries: GgrPoint[];
    loading: boolean;
    error: string | null;
    range: ChartRange;
  } => ({
    depositsWithdrawalsSeries: [],
    ggrSeries: [],
    loading: false,
    error: null,
    range: "30d",
  }),

  actions: {
    setRange(range: ChartRange) {
      this.range = range;
    },

    /** Pass days to override range (e.g. from TimeRangeControl: 7, 30, 90). */
    async fetchHomepageCharts(daysOverride?: number): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const days = daysOverride ?? rangeToDays(this.range);
        const payload = await fetchHomepageChartsData(days);
        this.depositsWithdrawalsSeries = payload.depositsWithdrawals;
        this.ggrSeries = payload.ggr;
      } catch (e) {
        this.error = e instanceof Error ? e.message : "Failed to load chart data";
      } finally {
        this.loading = false;
      }
    },
  },
});
