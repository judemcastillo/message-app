import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

async function assertMember(userId, conversationId) {
	const member = await prisma.conversationParticipant.findFirst({
		where: { conversationId, userId },
		select: { id: true },
	});
	return Boolean(member);
}

export async function GET(_req, { params: p }) {
	const { id } = await p;
	const { userId } = await requireUser();
	const ok = await assertMember(userId, id);
	if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const messages = await prisma.message.findMany({
		where: { conversationId: id },
		include: {
			sender: { include: { profile: true } },
		},
		orderBy: { createdAt: "asc" },
		take: 200, // simple cap; add cursor pagination later
	});

	return NextResponse.json(messages);
}
