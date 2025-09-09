"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function sendMessage(conversationId, _prev, formData) {
	const { userId } = await requireUser();
	const content = String(formData.get("content") || "").trim();
	if (!content) return { errors: { content: ["Message is empty"] } };

	// double-check membership
	const m = await prisma.conversationParticipant.findFirst({
		where: { conversationId, userId },
		select: { id: true },
	});
	if (!m) return { errors: { _form: ["Not allowed"] } };

	await prisma.message.create({
		data: { conversationId, senderId: userId, content },
	});
	await prisma.conversation.update({
		where: { id: conversationId },
		data: { updatedAt: new Date() },
	});

	// refresh any server components rendering this thread
	revalidatePath(`/messages/${conversationId}`);
	return { ok: true };
}
