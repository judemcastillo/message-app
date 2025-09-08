import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);
const COOKIE_NAME = "session";

export async function createSession(userId) {
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

	const token = await encrypt({ userId });
	cookies().set(COOKIE_NAME, token, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		expires: expiresAt,
		path: "/",
	});
}

export async function deleteSession() {
	await cookies().delete(COOKIE_NAME);
}

export async function encrypt(payload) {
	return new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("7d")
		.sign(encodedKey);
}

export async function decrypt(session = "") {
	try {
		const { payload } = await jwtVerify(session, encodedKey, {
			algorithms: ["HS256"],
		});
		return payload;
	} catch (error) {
		console.log("Failed to verify session");
	}
}

export async function getSession() {
	const store = await cookies();
	const token = store.get(COOKIE_NAME)?.value;

	if (!token) return null;
	const payload = await decrypt(token).catch(() => null);
	return payload ? { userId: payload.userId } : null;
}
