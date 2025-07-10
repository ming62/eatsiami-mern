import { create } from "zustand";

export const useNotificationStore = create((set) => ({
  badgeCount: 0,
  setBadgeCount: (count) => set({ badgeCount: count }),
}));
