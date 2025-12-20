"use client";

import { useSellerFAQ } from "@/hooks/faq/useSellerFAQ";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Assuming present

interface ProductAnswer {
    id: string;
    content: string;
    createdAt: string;
    seller: {
        sellerProfile: {
            shopName: string;
        }
    }
}

interface ProductQuestion {
    id: string;
    content: string;
    createdAt: string;
    user: {
        firstName: string;
        lastName: string;
    }
    answers: ProductAnswer[];
}

export default function SellerFAQ({ productId }: { productId: string }) {
    const { questions, isLoading, submitAnswer } = useSellerFAQ(productId) as {
        questions: ProductQuestion[],
        isLoading: boolean,
        submitAnswer: (id: string, text: string) => Promise<void>
    };
    const [replyText, setReplyText] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});

    const handleReplyChange = (id: string, text: string) => {
        setReplyText(prev => ({ ...prev, [id]: text }));
    };

    const handleSubmit = async (id: string) => {
        const text = replyText[id];
        if (!text?.trim()) return;

        setIsSubmitting(prev => ({ ...prev, [id]: true }));
        try {
            await submitAnswer(id, text);
            setReplyText(prev => ({ ...prev, [id]: "" }));
        } finally {
            setIsSubmitting(prev => ({ ...prev, [id]: false }));
        }
    };

    if (isLoading) return <div className="text-muted-foreground p-4">Loading questions...</div>;

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">Product Questions</h3>
            {questions.length === 0 ? (
                <p className="text-muted-foreground italic">No questions asked yet.</p>
            ) : (
                <div className="space-y-4">
                    {questions.map(q => (
                        <div key={q.id} className="border rounded-lg p-4 bg-card">
                            <div className="flex justify-between">
                                <p className="font-medium text-lg">{q.content}</p>
                                <span className="text-xs text-muted-foreground">{formatDistanceToNow(q.createdAt)} ago</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">Asked by {q.user.firstName || "Customer"}</p>

                            <div className="space-y-3 pl-4 border-l-2">
                                {q.answers.map(a => (
                                    <div key={a.id} className="bg-muted/50 p-2 rounded">
                                        <p className="text-sm">{a.content}</p>
                                        <p className="text-[10px] text-muted-foreground text-right">{formatDistanceToNow(a.createdAt)} ago</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 gap-2 flex items-start">
                                <Textarea
                                    placeholder="Type answer..."
                                    value={replyText[q.id] || ""}
                                    onChange={(e) => handleReplyChange(q.id, e.target.value)}
                                    className="min-h-[60px]"
                                />
                                <Button
                                    size="sm"
                                    onClick={() => handleSubmit(q.id)}
                                    disabled={!replyText[q.id]?.trim() || isSubmitting[q.id]}
                                >
                                    {isSubmitting[q.id] ? "Sending..." : "Reply"}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
