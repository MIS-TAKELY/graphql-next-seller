"use client";
import { useEffect, useRef } from "react";
import Pusher from "pusher-js";

let pusherInstance: Pusher | null = null;

const getPusher = () => {
    if (!pusherInstance) {
        pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || "app-key", {
            wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST || "127.0.0.1",
            wsPort: parseInt(process.env.NEXT_PUBLIC_PUSHER_PORT || "6001"),
            forceTLS: process.env.NEXT_PUBLIC_PUSHER_USE_TLS === "true",
            disableStats: true,
            enabledTransports: ["ws", "wss"],
            cluster: "mt1"
        });
    }
    return pusherInstance;
};

export function useRealtime(config: any) {
    const configRef = useRef(config);
    configRef.current = config;

    useEffect(() => {
        const pusher = getPusher();

        let channelsToSub: string[] = [];
        if (config.channel) channelsToSub = [config.channel];
        if (config.channels) channelsToSub = config.channels;

        channelsToSub = channelsToSub.filter(Boolean);
        if (channelsToSub.length === 0) return;

        const bindings: { channel: string, eventName: string, innerCb: Function }[] = [];

        channelsToSub.forEach(ch => {
            const channel = pusher.subscribe(ch);

            if (config.event) {
                const innerCb = (data: any) => {
                    if (configRef.current.onData) configRef.current.onData(data);
                };
                channel.bind(config.event, innerCb);
                bindings.push({ channel: ch, eventName: config.event, innerCb });
            }

            if (config.events) {
                Object.entries(config.events).forEach(([category, actions]) => {
                    Object.entries(actions as any).forEach(([action, _cb]: any) => {
                        const eventName = `${category}.${action}`;
                        const innerCb = (data: any) => {
                            if (configRef.current.events?.[category]?.[action]) {
                                configRef.current.events[category][action](data);
                            }
                        };
                        channel.bind(eventName, innerCb);
                        bindings.push({ channel: ch, eventName, innerCb });
                    });
                });
            }
        });

        return () => {
            channelsToSub.forEach(ch => {
                const channel = pusher.channel(ch);
                if (channel) {
                    bindings.filter(b => b.channel === ch).forEach(b => {
                        channel.unbind(b.eventName, b.innerCb as any);
                    });
                }
            });
        };
    }, [JSON.stringify(config.channels), config.channel, config.event]);
}
