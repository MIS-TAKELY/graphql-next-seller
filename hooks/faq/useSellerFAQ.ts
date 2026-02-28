"use client";

import { useMutation, useQuery, useApolloClient } from "@apollo/client";
import { GET_PRODUCT_QUESTIONS, REPLY_TO_QUESTION } from "@/client/faq/faq.queries";
import { NewAnswerPayload, NewQuestionPayload } from "@/lib/realtime";
import { useRealtime } from "@/lib/usePusherRealtime";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

export function useSellerFAQ(productId: string) {
    const client = useApolloClient();

    const { data, loading: isLoading } = useQuery(GET_PRODUCT_QUESTIONS, {
        variables: { productId },
        skip: !productId,
        fetchPolicy: "cache-and-network"
    });

    const [replyToQuestionMutation] = useMutation(REPLY_TO_QUESTION);

    // Realtime Handlers
    const handleNewQuestion = useCallback((payload: NewQuestionPayload) => {
        if (payload.productId !== productId) return;

        try {
            const queryData = client.readQuery<any>({
                query: GET_PRODUCT_QUESTIONS,
                variables: { productId }
            });

            if (queryData?.getProductQuestions) {
                // Check dup
                if (queryData.getProductQuestions.some((q: any) => q.id === payload.id)) return;

                client.writeQuery({
                    query: GET_PRODUCT_QUESTIONS,
                    variables: { productId },
                    data: {
                        getProductQuestions: [
                            {
                                id: payload.id,
                                productId: payload.productId,
                                content: payload.content,
                                createdAt: payload.createdAt,
                                user: {
                                    firstName: payload.user.firstName,
                                    lastName: payload.user.lastName,
                                    __typename: "User"
                                },
                                answers: [],
                                __typename: "ProductQuestion"
                            },
                            ...queryData.getProductQuestions
                        ]
                    }
                });
                toast.info("New question received!");
            }
        } catch (error) {
            console.error(error);
        }
    }, [client, productId]);

    const handleNewAnswer = useCallback((payload: NewAnswerPayload) => {
        // Update cache when real-time answer comes (e.g. from another tab or mobile)
        try {
            const queryData = client.readQuery<any>({
                query: GET_PRODUCT_QUESTIONS,
                variables: { productId }
            });

            if (queryData?.getProductQuestions) {
                const updatedQuestions = queryData.getProductQuestions.map((q: any) => {
                    if (q.id === payload.questionId) {
                        if (q.answers.some((a: any) => a.id === payload.id)) return q;
                        return {
                            ...q,
                            answers: [
                                ...q.answers,
                                {
                                    id: payload.id,
                                    content: payload.content,
                                    createdAt: payload.createdAt,
                                    seller: {
                                        sellerProfile: {
                                            shopName: payload.seller.shopName,
                                            __typename: "SellerProfile"
                                        },
                                        __typename: "User"
                                    },
                                    __typename: "ProductAnswer"
                                }
                            ]
                        };
                    }
                    return q;
                });

                client.writeQuery({
                    query: GET_PRODUCT_QUESTIONS,
                    variables: { productId },
                    data: {
                        getProductQuestions: updatedQuestions
                    }
                });
            }
        } catch (e) {
            console.error(e);
        }
    }, [client, productId]);

    useRealtime({
        channels: [`product:${productId}:faq`],
        event: "faq.newQuestion",
        onData: handleNewQuestion,
    });

    useRealtime({
        channels: [`product:${productId}:faq`],
        event: "faq.newAnswer",
        onData: handleNewAnswer,
    });

    const submitAnswer = async (questionId: string, content: string) => {
        try {
            await replyToQuestionMutation({
                variables: { questionId, content },
                optimisticResponse: {
                    replyToQuestion: {
                        id: `temp-${Date.now()}`,
                        questionId,
                        content,
                        createdAt: new Date().toISOString(),
                        seller: {
                            sellerProfile: {
                                shopName: "You",
                                __typename: "SellerProfile"
                            },
                            __typename: "User"
                        },
                        __typename: "ProductAnswer"
                    }
                },
                update: (cache, { data: { replyToQuestion } }) => {
                    const existingData = cache.readQuery<any>({
                        query: GET_PRODUCT_QUESTIONS,
                        variables: { productId }
                    });

                    if (existingData?.getProductQuestions) {
                        const updatedQuestions = existingData.getProductQuestions.map((q: any) => {
                            if (q.id === questionId) {
                                return {
                                    ...q,
                                    answers: [...q.answers, replyToQuestion]
                                };
                            }
                            return q;
                        });

                        cache.writeQuery({
                            query: GET_PRODUCT_QUESTIONS,
                            variables: { productId },
                            data: {
                                getProductQuestions: updatedQuestions
                            }
                        });
                    }
                }
            });
            toast.success("Answer sent");
        } catch (error) {
            console.error(error);
            toast.error("Failed to send answer");
        }
    };

    return {
        questions: data?.getProductQuestions || [],
        isLoading,
        submitAnswer
    };
}
