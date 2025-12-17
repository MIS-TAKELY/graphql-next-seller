"use client";

import { getSellerQuestions, replyToQuestion } from "@/app/actions/faq";
import { SellerQuestion } from "@/types/faq";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useAllSellerQuestions() {
    const [questions, setQuestions] = useState<SellerQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            const data = await getSellerQuestions();
            setQuestions(data.map((q: any) => ({
                ...q,
                createdAt: new Date(q.createdAt),
                answers: q.answers.map((a: any) => ({
                    ...a,
                    createdAt: new Date(a.createdAt),
                }))
            })));
        } catch (error) {
            console.error(error);
            toast.error("Failed to load questions");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const submitAnswer = async (questionId: string, content: string) => {
        try {
            const answer = await replyToQuestion(questionId, content);
            setQuestions(prev => prev.map(q => {
                if (q.id === questionId) {
                    return {
                        ...q,
                        answers: [...q.answers, {
                            id: answer.id,
                            content: answer.content,
                            createdAt: new Date(answer.createdAt),
                            seller: {
                                // @ts-ignore
                                sellerProfile: answer.seller?.sellerProfile
                            }
                        }]
                    };
                }
                return q;
            }));
            toast.success("Reply sent!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to send reply");
            throw error;
        }
    };

    return {
        questions,
        isLoading,
        submitAnswer,
        refetch: fetchQuestions
    };
}
