"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const ProfileSchema = z.object({
	displayName: z.string().trim().min(1, "Required").max(50),
	bio: z.string().trim().max(500).optional().or(z.literal("")),
	avatarUrl: z
		.string()
		.trim()
		.url("Must be a valid URL")
		.optional()
		.or(z.literal("")),
});

export async function updateProfile(prev, formData) {
	const { userId } = await requireUser();
	const parsed = ProfileSchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

	const { displayName, bio, avatarUrl } = parsed.data;

	await prisma.profile.upsert({
		where: { userId },
		create: {
			userId,
			displayName,
			bio: bio || null,
			avatarUrl: avatarUrl || null,
		},
		update: { displayName, bio: bio || null, avatarUrl: avatarUrl || null },
	});

	revalidatePath("/profile");
	return { ok: true };
}
