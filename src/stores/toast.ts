import { defineStore } from "pinia";

export type ToastTone = "default" | "success" | "warning" | "danger" | "info";

export type ToastItem = {
  id: string;
  title: string;
  message?: string;
  tone: ToastTone;
};

export const useToastStore = defineStore("toast", {
  state: (): { items: ToastItem[] } => ({ items: [] }),
  actions: {
    push(t: Omit<ToastItem, "id">) {
      const id = "t_" + Math.random().toString(36).slice(2);
      const next = { ...t, id };
      this.items = [next, ...this.items].slice(0, 4);
      window.setTimeout(() => {
        this.items = this.items.filter((x) => x.id !== id);
      }, 3200);
    },
  },
});
