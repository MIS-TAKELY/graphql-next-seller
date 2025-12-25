"use client";

import { useRealtime } from "@upstash/realtime/client";
import { useSession } from "@/lib/auth-client";
import { useCallback, useMemo } from "react";

export function useConversationRealtime(onNewMessage: () => void) {
    const { data: session } = useSession();
    const userId = session?.user?.id;

    const stableCallback = useCallback(() => {
        onNewMessage();
    }, [onNewMessage]);

    const events = useMemo(
        () => ({
            message: {
                newMessage: stableCallback,
            },
        }),
        [stableCallback]
    );

    (useRealtime as any)({
        channel: userId ? `user:${userId}` : undefined,
        events,
    });
}
