"use client";

import { useRealtime } from "@upstash/realtime/client";
import { useSession } from "@/lib/auth-client";
import { useMemo } from "react";

export function useConversationRealtime(onNewMessage: () => void) {
    const { data: session } = useSession();
    const userId = session?.user?.id;

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
