import { NextResponse } from "next/server";
import { verifySession } from "@/lib/edge-jwt"; // adjust to "../../lib/edge-jwt" if you don't use "@"

function isProtected(pathname) {
  return pathname.startsWith("/messages") || pathname.startsWith("/profile");
}
function isPublic(pathname) {
  return pathname === "/login" || pathname === "/register" || pathname === "/";
}

export default async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Edge-safe cookie read
  const token = await req.cookies.get("session")?.value || null;
  const session = await verifySession(token);

  if (isProtected(pathname) && !session?.userId) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isPublic(pathname) && session?.userId) {
    const url = req.nextUrl.clone();
    url.pathname = "/messages";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/messages/:path*",
    "/profile",
    "/login",
    "/register",
    "/", // include home if you want middleware to run there
  ],
};
