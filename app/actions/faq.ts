"use server";

import { prisma } from "@/lib/db/prisma";
import { realtime } from "@/lib/realtime";
import { auth } from "@clerk/nextjs/server";

export async function replyToQuestion(questionId: string, content: string) {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    // Verify seller and get internal user ID
    const user = await prisma.user.findUnique({
        where: { clerkId },
        include: { sellerProfile: true }
    });

    if (!user || !user.sellerProfile) throw new Error("Not a seller");

    // @ts-ignore
    const answer = await prisma.productAnswer.create({
        data: {
            questionId,
            sellerId: user.id,
            content,
        },
        include: {
            question: true
        }
    });

    await realtime.channel(`product:${answer.question.productId}:faq`).emit("faq.newAnswer", {
        id: answer.id,
        questionId: answer.questionId,
        content: answer.content,
        createdAt: answer.createdAt,
        seller: {
            shopName: user.sellerProfile.shopName,
        },
    });

    return answer;
}

export async function getQuestionsForProduct(productId: string) {
    // @ts-ignore
    return await prisma.productQuestion.findMany({
        where: { productId },
        include: {
            user: {
                select: { firstName: true, lastName: true }
            },
            answers: true
        },
        orderBy: { createdAt: "desc" }
    });
}
