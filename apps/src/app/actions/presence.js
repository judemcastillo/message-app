"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// How often we'll actually write to DB at most
const THROTTLE_MS = 20_000;
// Consider a user "online" if they pinged within this window
const ONLINE_WINDOW_MS = 75_000;

/**
 * Heartbeat: mark the current user online.
 * Uses a write throttle to avoid DB spam.
 */
export async function heartbeatAction() {
	const session = await getSession();
	if (!session?.userId) return { ok: false, status: 401 };

	const now = new Date();
	const threshold = new Date(now.getTime() - THROTTLE_MS);

	await prisma.user.updateMany({
		where: {
			id: session.userId,
			OR: [{ lastSeenAt: null }, { lastSeenAt: { lt: threshold } }],
		},
		data: { lastSeenAt: now },
	});

	return { ok: true };
}

/**
 * Presence lookup: are these user IDs online?
 * ids: string[]
 */
export async function presenceStatusAction(ids) {
	if (!Array.isArray(ids) || ids.length === 0) return { online: {} };

	const cutoff = new Date(Date.now() - ONLINE_WINDOW_MS);

	const rows = await prisma.user.findMany({
		where: { id: { in: ids } },
		select: { id: true, lastSeenAt: true },
	});

	const online = {};
	for (const r of rows)
		online[r.id] = !!(r.lastSeenAt && r.lastSeenAt >= cutoff);
	for (const id of ids) if (!(id in online)) online[id] = false;

	return { online };
}
