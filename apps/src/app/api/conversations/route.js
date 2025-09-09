import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

export async function GET() {
	const { userId: me } = await requireUser();

	const convos = await prisma.conversation.findMany({
		where: { participants: { some: { userId: me } } },
		include: {
			participants: {
				include: { user: { include: { profile: true } } },
			},
			messages: { take: 1, orderBy: { createdAt: "desc" } },
		},
		orderBy: { updatedAt: "desc" },
	});

	// normalize for the client
	const data = convos.map((c) => {
		const last = c.messages[0] || null;
		const others = c.participants.map((p) => p.user).filter((u) => u.id !== me);
		const other = others[0]; // 1:1 chat for now
		return {
			id: c.id,
			other: other
				? {
						id: other.id,
						name: other.profile?.displayName || other.name || other.email,
						email: other.email,
						avatar: other.profile?.avatarUrl || null,
					}
				: null,
			lastMessage: last
				? { content: last.content, createdAt: last.createdAt }
				: null,
			updatedAt: c.updatedAt,
		};
	});

	return NextResponse.json(data);
}
