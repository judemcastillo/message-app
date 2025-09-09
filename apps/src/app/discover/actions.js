"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function requestFriend(otherId) {
	const { userId: me } = await requireUser();
	if (!otherId || otherId === me) return { ok: false };

	const existing = await prisma.friendship.findFirst({
		where: {
			OR: [
				{ requesterId: me, addresseeId: otherId },
				{ requesterId: otherId, addresseeId: me },
			],
		},
		select: { status: true },
	});
	if (existing) return { ok: true };

	await prisma.friendship.create({
		data: { requesterId: me, addresseeId: otherId, status: "PENDING" },
	});

	revalidatePath("/discover");
	revalidatePath(`/u/${otherId}`);
	return { ok: true };
}

export async function acceptFriendFrom(otherId) {
	const { userId: me } = await requireUser();
	await prisma.friendship.updateMany({
		where: { requesterId: otherId, addresseeId: me, status: "PENDING" },
		data: { status: "ACCEPTED" },
	});
	revalidatePath("/discover");
	revalidatePath(`/u/${otherId}`);
	return { ok: true };
}
