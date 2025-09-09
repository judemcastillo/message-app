import "server-only";
import { prisma } from "@/lib/prisma";

export async function areFriends(a, b) {
	const row = await prisma.friendship.findFirst({
		where: {
			status: "ACCEPTED",
			OR: [
				{ requesterId: a, addresseeId: b },
				{ requesterId: b, addresseeId: a },
			],
		},
		select: { id: true },
	});
	return Boolean(row);
}

export async function getFriendStatus(me, otherId) {
	if (me === otherId) return "self";
	const r = await prisma.friendship.findFirst({
		where: {
			OR: [
				{ requesterId: me, addresseeId: otherId },
				{ requesterId: otherId, addresseeId: me },
			],
		},
		select: { requesterId: true, addresseeId: true, status: true },
	});
	if (!r) return "none";
	if (r.status === "ACCEPTED") return "accepted";
	if (r.status === "BLOCKED") return "blocked";
	// pending:
	return r.requesterId === me ? "pending_out" : "pending_in";
}

export async function getStatusesFor(me, userIds) {
	if (!Array.isArray(userIds) || userIds.length === 0) return {};
	const rows = await prisma.friendship.findMany({
		where: {
			OR: [
				{ requesterId: me, addresseeId: { in: userIds } },
				{ requesterId: { in: userIds }, addresseeId: me },
			],
		},
		select: { requesterId: true, addresseeId: true, status: true },
	});

	const map = Object.fromEntries(userIds.map((id) => [id, "none"]));
	for (const r of rows) {
		const other = r.requesterId === me ? r.addresseeId : r.requesterId;
		if (r.status === "ACCEPTED") map[other] = "accepted";
		else if (r.status === "BLOCKED") map[other] = "blocked";
		else map[other] = r.requesterId === me ? "pending_out" : "pending_in";
	}
	return map;
}

export async function getAcceptedFriends(userId) {
	const rows = await prisma.friendship.findMany({
		where: {
			status: "ACCEPTED",
			OR: [{ requesterId: userId }, { addresseeId: userId }],
		},
		include: {
			requester: { include: { profile: true } },
			addressee: { include: { profile: true } },
		},
		orderBy: { createdAt: "desc" },
	});

	return rows.map((r) => {
		const other = r.requesterId === userId ? r.addressee : r.requester;
		return {
			id: other.id,
			name: other.profile?.displayName || other.name || other.email,
			email: other.email,
		};
	});
}
