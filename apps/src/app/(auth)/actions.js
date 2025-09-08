"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

const RegisterSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	name: z.string().min(2).max(50),
});

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

export async function register(prevState, formData) {
	const parsed = RegisterSchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors };
	}

	const { name, email, password } = parsed.data;

	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) {
		return { errors: { email: ["Email already in use"] } };
	}

	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		await prisma.user.create({
			data: {
				email,
				hashedPassword,
				name,
				profile: { create: { displayName: name } },
			},
		});
		redirect("/login"); // success → go to login
	} catch (e) {
		console.error(e);
		return { errors: { _form: ["Something went wrong. Please try again."] } };
	}
}

export async function login(prevState, formData) {
	const data =
		formData instanceof FormData ? Object.fromEntries(formData) : formData;
	const result = loginSchema.safeParse(data);
	if (!result.success) {
		return { errors: result.error.flatten().fieldErrors };
	}

	const { email, password } = result.data;
	const user = await prisma.user.findUnique({ where: { email } });
	const bad = !user || !(await bcrypt.compare(password, user.hashedPassword));
	if (bad) {
		return { errors: { email: ["Invalid email or password"] } };
	}

	await createSession(user.id);
	redirect("/messages");
}

// Optional: use this for a sign-out form action
export async function logout() {
	await deleteSession();
	redirect("/");
}
