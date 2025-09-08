import { jwtVerify } from "jose";

const key = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    // payload contains { userId, iat, exp }
    return payload;
  } catch {
    return null;
  }
}
