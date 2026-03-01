"use server";

import { prisma } from "@/lib/db/prisma";
import { pusher } from "@/lib/realtime";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getSession() {
    return await auth.api.getSession({
        headers: await headers(),
    });
}

export async function replyToQuestion(questionId: string, content: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const userId = session.user.id;

    // Verify seller and get internal user ID
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { sellerProfile: true }
    });

    if (!user || !user.sellerProfile) throw new Error("Not a seller");

    // Verify ownership
    // @ts-ignore
    const question = await prisma.productQuestion.findUnique({
        where: { id: questionId },
        include: { product: true }
    });

    // @ts-ignore
    if (!question || question.product.sellerId !== user.id) {
        throw new Error("Unauthorized to reply to this question");
    }

    // @ts-ignore
    const answerResult = await prisma.productAnswer.create({
        data: {
            questionId,
            sellerId: user.id,
            content,
        },
        include: {
            question: true,
            seller: {
                include: {
                    sellerProfile: true
                }
            }
        }
    });

    // Fix Decimal serialization
    if (answerResult.seller?.sellerProfile) {
        (answerResult.seller.sellerProfile as any).averageRating =
            (answerResult.seller.sellerProfile as any).averageRating?.toNumber() || 0;
    }

    // @ts-ignore
    await pusher.trigger(`product-${answerResult.question.productId}-faq`, "faq.newAnswer", {
        id: answerResult.id,
        questionId: answerResult.questionId,
        content: answerResult.content,
        createdAt: answerResult.createdAt,
        seller: {
            shopName: user.sellerProfile.shopName,
        },
    });

    return answerResult;
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

export async function getSellerQuestions() {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { sellerProfile: true }
    });

    if (!user || !user.sellerProfile) throw new Error("Not a seller");

    // @ts-ignore
    const items = await prisma.productQuestion.findMany({
        where: {
            product: {
                sellerId: user.id
            }
        },
        include: {
            product: {
                select: { name: true, images: true }
            },
            user: {
                select: { firstName: true, lastName: true }
            },
            answers: {
                include: {
                    seller: { include: { sellerProfile: true } }
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    // Fix Decimal serialization
    return items.map((q: any) => ({
        ...q,
        answers: q.answers.map((a: any) => ({
            ...a,
            seller: {
                ...a.seller,
                sellerProfile: a.seller?.sellerProfile ? {
                    ...a.seller.sellerProfile,
                    averageRating: a.seller.sellerProfile.averageRating?.toNumber() || 0
                } : null
            }
        }))
    }));
}
