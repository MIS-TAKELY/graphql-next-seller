import { SellerQuestion } from "@/types/faq";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface QuestionItemProps {
    question: SellerQuestion;
    isActive: boolean;
    onClick: () => void;
}

export default function QuestionItem({ question, isActive, onClick }: QuestionItemProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex flex-col gap-1 p-3 rounded-lg cursor-pointer transition-colors border",
                isActive
                    ? "bg-accent text-accent-foreground border-primary/50"
                    : "hover:bg-muted/50 border-transparent"
            )}
        >
            <div className="flex justify-between items-start">
                <span className="font-semibold truncate max-w-[70%]">
                    {question.user.firstName || "Customer"}
                </span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                </span>
            </div>

            <p className="text-xs font-medium text-primary/80 truncate">
                {question.product.name}
            </p>

            <p className="text-sm text-muted-foreground line-clamp-2">
                {question.content}
            </p>
        </div>
    );
}
