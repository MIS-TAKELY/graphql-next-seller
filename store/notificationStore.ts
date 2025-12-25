import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationState {
    lastSeenOrderUpdate: string | null;
    hasNewOrderUpdate: boolean;
    setLastSeenOrderUpdate: (timestamp: string) => void;
    setHasNewOrderUpdate: (hasUpdate: boolean) => void;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set) => ({
            lastSeenOrderUpdate: null,
            hasNewOrderUpdate: false,
            setLastSeenOrderUpdate: (timestamp) => set({ lastSeenOrderUpdate: timestamp, hasNewOrderUpdate: false }),
            setHasNewOrderUpdate: (hasUpdate) => set({ hasNewOrderUpdate: hasUpdate }),
        }),
        {
            name: "seller-notification-storage",
        }
    )
);
