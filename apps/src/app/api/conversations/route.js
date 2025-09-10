import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

export async function GET() {
	const { userId: me } = await requireUser();

	const convos = await prisma.conversation.findMany({
		where: { participants: { some: { userId: me } } },
		include: {
			participants: {
				include: {
					user: {
						select: {
							id: true,
							email: true,
							name: true,
							profile: { select: { displayName: true, avatarUrl: true } },
						},
					},
				},
			},
			messages: {
				take: 1,
				orderBy: { createdAt: "desc" },
				select: { content: true, imageUrl: true, createdAt: true },
			},
		},
		orderBy: { updatedAt: "desc" },
	});

	const data = convos.map((c) => {
		const last = c.messages[0] || null;

		if (c.isGroup) {
			// Members (with me included)
			const members = c.participants.map((p) => ({
				id: p.user.id,
				name: p.user.profile?.displayName || p.user.name || p.user.email,
				avatar: p.user.profile?.avatarUrl || null,
			}));
			const memberIds = members.map((m) => m.id);
			const others = members.filter((m) => m.id !== me);

			// Fallback title like: "Alice, Bob +2"
			const fallbackTitle = (() => {
				if (others.length === 0) return "Group";
				const names = others.map((o) => o.name);
				return names.length <= 2
					? names.join(", ")
					: `${names[0]}, ${names[1]} +${names.length - 2}`;
			})();

			return {
				id: c.id,
				isGroup: true,
				title: c.title || fallbackTitle,
				groupAvatar: c.avatarUrl || null,
				memberIds,
				// If you want to render small member pills you can expose a few:
				members: others.slice(0, 3),
				lastMessage: last
					? {
							content: last.content,
							imageUrl: last.imageUrl || null,
							createdAt: last.createdAt,
						}
					: null,
				updatedAt: c.updatedAt,
			};
		}

		// 1:1
		const otherPart = c.participants.find((p) => p.user.id !== me);
		const other = otherPart?.user || null;

		return {
			id: c.id,
			isGroup: false,
			other: other
				? {
						id: other.id,
						name: other.profile?.displayName || other.name || other.email,
						email: other.email,
						avatar: other.profile?.avatarUrl || null,
					}
				: null,
			lastMessage: last
				? {
						content: last.content,
						imageUrl: last.imageUrl || null,
						createdAt: last.createdAt,
					}
				: null,
			updatedAt: c.updatedAt,
		};
	});

	return NextResponse.json(data);
}
