"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Small helper
async function meOrThrow() {
	const s = await getSession();
	if (!s?.userId) throw new Error("Not authenticated");
	return s.userId;
}

function uniqStrings(arr = []) {
	return Array.from(new Set(arr.filter(Boolean)));
}

function nameOf(u) {
	return u?.profile?.displayName || u?.name || u?.email || "User";
}

function fallbackGroupTitle(users, meId) {
	const others = users.filter((u) => u.id !== meId).map(nameOf);
	if (others.length <= 2) return others.join(", ") || "Group";
	return `${others[0]}, ${others[1]} +${others.length - 2}`;
}

/**
 * Create a new group conversation.
 * @param {Object} params
 * @param {string} params.title
 * @param {string[]} params.memberIds - must include the current user or we add them
 * @param {string|null} params.avatarUrl
 */
export async function createGroupAction({
	title,
	memberIds = [],
	avatarUrl = null,
}) {
	const me = await meOrThrow();

	const unique = uniqStrings([me, ...memberIds]);
	if (unique.length < 2) throw new Error("A group needs at least 2 people.");

	// sanitize members
	const toInvite = uniqStrings(memberIds).filter((id) => id && id !== me);
	if (toInvite.length === 0) {
		// you can choose to allow 0 (just you), but usually at least one other
		throw new Error("Select at least one friend");
	}

	// load users to build a fallback title if needed
	const users = await prisma.user.findMany({
		where: { id: { in: [me, ...toInvite] } },
		include: { profile: true },
	});

	const cleanTitle = (title || "").trim();
	const finalTitle = cleanTitle || fallbackGroupTitle(users, me);

	const convo = await prisma.conversation.create({
		data: {
			isGroup: true,
			title: finalTitle,
			avatarUrl,
			createdById: me,
			participants: {
				create: unique.map((id) => ({
					userId: id,
					role: id === me ? "OWNER" : "MEMBER",
				})),
			},
		},
	});

	revalidatePath("/messages");
	redirect(`/messages/${convo.id}`);
}

/**
 * Rename a group (owner or admin only).
 */
export async function renameGroupAction(conversationId, newTitle) {
	const me = await meOrThrow();
	const part = await prisma.conversationParticipant.findFirst({
		where: { conversationId, userId: me },
		select: { role: true, conversation: { select: { isGroup: true } } },
	});
	if (!part || !part.conversation.isGroup) throw new Error("Not in this group");
	if (part.role === "MEMBER") throw new Error("Only owner/admin can rename");

	await prisma.conversation.update({
		where: { id: conversationId },
		data: { title: newTitle?.trim() || "Group" },
	});

	revalidatePath(`/messages/${conversationId}`);
}

/**
 * Add people to a group (owner/admin).
 */
export async function addMembersAction(conversationId, memberIds = []) {
	const { userId: me } = await requireUser();

	// Load conversation + current members
	const convo = await prisma.conversation.findUnique({
		where: { id: conversationId },
		include: { participants: { select: { userId: true } } },
	});

	if (!convo || !convo.isGroup) {
		throw new Error("Conversation not found or not a group.");
	}
	// Only participants can add (tweak if you want stricter roles/owners)
	if (!convo.participants.some((p) => p.userId === me)) {
		throw new Error("Forbidden");
	}

	const have = new Set(convo.participants.map((p) => p.userId));

	// clean: dedupe, drop me, drop existing
	const toAdd = uniqStrings(memberIds).filter(
		(id) => id && id !== me && !have.has(id)
	);

	if (!toAdd.length) {
		revalidatePath(`/messages/${conversationId}`);
		return { ok: true, added: 0 };
	}

	// Insert participants; skipDuplicates prevents unique index errors
	await prisma.conversationParticipant.createMany({
		data: toAdd.map((id) => ({ conversationId, userId: id })),
		skipDuplicates: true,
	});

	revalidatePath(`/messages/${conversationId}`);
	return { ok: true, added: toAdd.length };
}

/**
 * Remove a member (owner/admin). Cannot remove owner.
 */
export async function removeMemberAction(conversationId, userId) {
	const me = await meOrThrow();
	const mePart = await prisma.conversationParticipant.findFirst({
		where: { conversationId, userId: me },
		select: { role: true, conversation: { select: { isGroup: true } } },
	});
	if (!mePart || !mePart.conversation.isGroup)
		throw new Error("Not in this group");
	if (mePart.role === "MEMBER") throw new Error("Only owner/admin can remove");

	const target = await prisma.conversationParticipant.findFirst({
		where: { conversationId, userId },
		select: { role: true },
	});
	if (!target) return { ok: true };
	if (target.role === "OWNER") throw new Error("Cannot remove the owner");

	await prisma.conversationParticipant.deleteMany({
		where: { conversationId, userId },
	});

	revalidatePath(`/messages/${conversationId}`);
	return { ok: true };
}

/**
 * Leave group (anyone). If owner leaves, promote an admin/member to OWNER (simple strategy).
 */
export async function leaveGroupAction(conversationId) {
	const me = await meOrThrow();

	const mePart = await prisma.conversationParticipant.findFirst({
		where: { conversationId, userId: me },
		select: { role: true },
	});
	if (!mePart) return redirect("/messages");

	await prisma.conversationParticipant.deleteMany({
		where: { conversationId, userId: me },
	});

	if (mePart.role === "OWNER") {
		// promote first remaining participant to OWNER
		const next = await prisma.conversationParticipant.findFirst({
			where: { conversationId },
			orderBy: { joinedAt: "asc" },
		});
		if (next) {
			await prisma.conversationParticipant.update({
				where: { id: next.id },
				data: { role: "OWNER" },
			});
		}
	}

	revalidatePath("/messages");
	redirect("/messages");
}

/**
 * Change group avatar (owner/admin).
 */
export async function setGroupAvatarAction(conversationId, avatarUrl) {
	const me = await meOrThrow();
	const part = await prisma.conversationParticipant.findFirst({
		where: { conversationId, userId: me },
		select: { role: true, conversation: { select: { isGroup: true } } },
	});
	if (!part || !part.conversation.isGroup) throw new Error("Not in this group");
	if (part.role === "MEMBER") throw new Error("Only owner/admin can update");

	await prisma.conversation.update({
		where: { id: conversationId },
		data: { avatarUrl },
	});

	revalidatePath(`/messages/${conversationId}`);
}
