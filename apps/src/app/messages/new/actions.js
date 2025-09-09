"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

// Start a chat with `otherId`. Reuse an existing 1:1 if it already exists.
export async function startConversation(otherId) {
	const { userId: me } = await requireUser();

	if (!otherId || otherId === me) {
		return { ok: false, errors: { _form: ["Invalid user"] } };
	}

	// must be friends (ACCEPTED) in your schema
	const ok = await prisma.friendship.findFirst({
		where: {
			status: "ACCEPTED",
			OR: [
				{ requesterId: me, addresseeId: otherId },
				{ requesterId: otherId, addresseeId: me },
			],
		},
		select: { id: true },
	});
	if (!ok)
		return { ok: false, errors: { _form: ["You must be friends first"] } };

	// reuse if a 1:1 already exists
	const existing = await prisma.conversation.findFirst({
		where: {
			isGroup: false,
			AND: [
				{ participants: { some: { userId: me } } },
				{ participants: { some: { userId: otherId } } },
			],
		},
		select: { id: true },
	});

	if (existing?.id) redirect(`/messages/${existing.id}`);

	const created = await prisma.conversation.create({
		data: {
			isGroup: false,
			participants: { create: [{ userId: me }, { userId: otherId }] },
		},
		select: { id: true },
	});

	redirect(`/messages/${created.id}`);
}
