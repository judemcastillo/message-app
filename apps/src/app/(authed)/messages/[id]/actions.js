"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

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

function extFrom(name, mime) {
	const fromName = name?.split(".").pop();
	if (fromName && fromName.length <= 5) return fromName.toLowerCase();
	if (mime === "image/jpeg") return "jpg";
	if (mime === "image/png") return "png";
	if (mime === "image/webp") return "webp";
	if (mime === "image/gif") return "gif";
	return "bin";
}

export async function uploadImage(conversationId, _prev, formData) {
	const { userId } = await requireUser();

	// verify participant
	const member = await prisma.conversationParticipant.findFirst({
		where: { conversationId, userId },
		select: { id: true },
	});
	if (!member) return { errors: { _form: ["Forbidden"] } };

	const file = formData.get("file");
	if (!file || typeof file === "string") {
		return { errors: { _form: ["No file provided"] } };
	}

	const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
	if (!allowed.includes(file.type)) {
		return { errors: { _form: ["Unsupported image type"] } };
	}
	if (file.size > 8 * 1024 * 1024) {
		return { errors: { _form: ["Image too large (max 8MB)"] } };
	}

	const ext = extFrom(file.name, file.type);
	const key = `${conversationId}/${userId}/${crypto.randomUUID()}.${ext}`;

	const { error } = await supabase.storage
		.from("chat-images")
		.upload(key, file, { contentType: file.type, upsert: false });

	if (error) {
		console.error(error);
		return { errors: { _form: ["Upload failed"] } };
	}

	// public bucket → public URL
	const { data } = supabase.storage.from("chat-images").getPublicUrl(key);
	const url = data?.publicUrl;

	await prisma.message.create({
		data: { conversationId, senderId: userId, content: "", imageUrl: url },
	});
	await prisma.conversation.update({
		where: { id: conversationId },
		data: { updatedAt: new Date() },
	});

	revalidatePath(`/messages/${conversationId}`);
	return { ok: true };
}
