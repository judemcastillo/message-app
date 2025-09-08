import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

/**
 * GET /api/conversations
 * Returns all conversations for the current user, with:
 * - participants (user + profile)
 * - last message (1 newest)
 * Ordered by most recently updated.
 */
export async function GET() {
	try {
		const { userId: me } = await requireUser();

		const conversations = await prisma.conversation.findMany({
			where: { participants: { some: { userId: me } } },
			include: {
				participants: {
					include: {
						user: { include: { profile: true } },
					},
				},
				messages: {
					take: 1,
					orderBy: { createdAt: "desc" },
				},
			},
			orderBy: { updatedAt: "desc" },
		});

		return NextResponse.json(conversations);
	} catch (err) {
		console.error("GET /api/conversations failed:", err);
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
}
