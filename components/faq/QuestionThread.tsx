"use strict";
import { SellerQuestion } from "@/types/faq";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface QuestionThreadProps {
    question: SellerQuestion;
    onReply: (questionId: string, content: string) => Promise<void>;
}

export default function QuestionThread({ question, onReply }: QuestionThreadProps) {
    const [replyText, setReplyText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!replyText.trim()) return;
        setIsSubmitting(true);
        try {
            await onReply(question.id, replyText);
            setReplyText("");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">{question.product.name}</h3>
                <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>Asked by {question.user.firstName || "Customer"}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(question.createdAt))} ago</span>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Main Question */}
                <div className="bg-muted/30 p-4 rounded-lg border">
                    <p className="text-lg font-medium">{question.content}</p>
                </div>

                {/* Answers */}
                <div className="space-y-4 pl-4 border-l-2">
                    {question.answers.map((answer) => (
                        <div key={answer.id} className="bg-primary/5 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-sm text-primary">
                                    {answer.seller.sellerProfile?.shopName || "You"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(answer.createdAt))} ago
                                </span>
                            </div>
                            <p className="text-sm">{answer.content}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reply Input */}
            <div className="p-4 border-t bg-background mt-auto">
                <div className="flex gap-2">
                    <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        className="min-h-[80px]"
                    />
                </div>
                <div className="flex justify-end mt-2">
                    <Button
                        onClick={handleSubmit}
                        disabled={!replyText.trim() || isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Reply
                    </Button>
                </div>
            </div>
        </div>
    );
}
