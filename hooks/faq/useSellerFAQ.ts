"use client";

import { getQuestionsForProduct, replyToQuestion } from "@/app/actions/faq";
import { NewAnswerPayload, NewQuestionPayload } from "@/lib/realtime";
import { useRealtime } from "@upstash/realtime/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export interface SellerAnswer {
    id: string;
    content: string;
    createdAt: Date;
    seller: { shopName: string };
}
export interface SellerQuestion {
    id: string;
    content: string;
    createdAt: Date;
    user: { firstName: string | null; lastName: string | null };
    answers: SellerAnswer[];
}

export function useSellerFAQ(productId: string) {
    const [questions, setQuestions] = useState<SellerQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getQuestionsForProduct(productId)
            .then((data: any) => {
                setQuestions(
                    data.map((q: any) => ({
                        ...q,
                        createdAt: new Date(q.createdAt),
                        answers: q.answers.map((a: any) => ({
                            ...a,
                            createdAt: new Date(a.createdAt),
                            seller: { shopName: "You" }, // Simplified
                        })),
                    }))
                );
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch questions");
            })
            .finally(() => setIsLoading(false));
    }, [productId]);

    const handleNewQuestion = useCallback(
        (payload: NewQuestionPayload) => {
            if (payload.productId !== productId) return;
            setQuestions((prev) => [
                {
                    id: payload.id,
                    content: payload.content,
                    createdAt: new Date(payload.createdAt),
                    user: payload.user as any,
                    answers: [],
                },
                ...prev,
            ]);
            toast.info("New question received!");
        },
        [productId]
    );

    const handleNewAnswer = useCallback((payload: NewAnswerPayload) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id === payload.questionId) {
                    if (q.answers.some(a => a.id === payload.id)) return q;
                    return {
                        ...q,
                        answers: [
                            ...q.answers,
                            {
                                id: payload.id,
                                content: payload.content,
                                createdAt: new Date(payload.createdAt),
                                seller: { shopName: payload.seller.shopName },
                            },
                        ],
                    };
                }
                return q;
            })
        );
    }, []);

    const events = useMemo(
        () => ({
            faq: {
                newQuestion: handleNewQuestion,
                newAnswer: handleNewAnswer,
            },
        }),
        [handleNewQuestion, handleNewAnswer]
    );

    (useRealtime as any)({
        channel: `product:${productId}:faq`,
        events,
    });

    const submitAnswer = async (questionId: string, content: string) => {
        try {
            const answer = await replyToQuestion(questionId, content);

            setQuestions((prev) =>
                prev.map((q) => {
                    if (q.id === questionId) {
                        return {
                            ...q,
                            answers: [
                                ...q.answers,
                                {
                                    id: answer.id,
                                    content: answer.content,
                                    createdAt: new Date(answer.createdAt),
                                    seller: { shopName: (answer as any).seller?.sellerProfile?.shopName || "You" },
                                },
                            ],
                        };
                    }
                    return q;
                })
            );
            toast.success("Answer sent");
        } catch (error) {
            console.error(error);
            toast.error("Failed to send answer");
            throw error;
        }
    };

    return { questions, isLoading, submitAnswer };
}
