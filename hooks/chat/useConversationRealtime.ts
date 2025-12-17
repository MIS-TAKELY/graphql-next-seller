"use client";

import { useRealtime } from "@upstash/realtime/client";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

export function useConversationRealtime(onNewMessage: () => void) {
    const { userId } = useAuth();

    const events = useMemo(
        () => ({
            message: {
                newMessage: () => {
                    onNewMessage();
                },
            },
        }),
        [onNewMessage]
    );

    (useRealtime as any)({
        channel: userId ? `user:${userId}` : undefined,
        events,
    });
}
