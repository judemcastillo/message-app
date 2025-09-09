// src/middleware.js
import { NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

const PUBLIC = ["/", "/login", "/register"];

export default async function middleware(req) {
	const { pathname } = req.nextUrl;

	const token = req.cookies.get("session")?.value || null; // ✅ edge-safe
	const session = await decrypt(token);

	const isPublic = PUBLIC.includes(pathname);

	if (!session?.userId && !isPublic) {
		const url = req.nextUrl.clone();
		url.pathname = "/login";
		url.search = "";
		return NextResponse.redirect(url);
	}

	if (session?.userId && isPublic) {
		const url = req.nextUrl.clone();
		url.pathname = "/messages";
		url.search = "";
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/",
		"/messages/:path*",
		"/discover",
		"/friends",
		"/u/:path*",
		"/login",
		"/register",
	],
};
