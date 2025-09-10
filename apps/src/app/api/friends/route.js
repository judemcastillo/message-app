import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session"; // your existing helper

// GET /api/friends?q=search&limit=50
export async function GET(req) {
	const session = await getSession();
	const me = session?.userId;
	if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { searchParams } = new URL(req.url);
	const q = (searchParams.get("q") || "").trim();
	const limit = Math.min(Number(searchParams.get("limit") || 50), 200);

	// Find accepted friendships where I'm requester or addressee
	const rows = await prisma.friendship.findMany({
		where: {
			status: "ACCEPTED",
			OR: [{ requesterId: me }, { addresseeId: me }],
		},
		include: {
			requester: { include: { profile: true } },
			addressee: { include: { profile: true } },
		},
		orderBy: { createdAt: "desc" },
		take: limit * 2, // take a bit extra; we’ll filter below if q is set
	});

	// Map to the "other" user in each friendship
	let friends = rows.map((r) => {
		const other = r.requesterId === me ? r.addressee : r.requester;
		return {
			id: other.id,
			name: other.name,
			email: other.email,
			profile: other.profile
				? {
						displayName: other.profile.displayName || null,
						avatarUrl: other.profile.avatarUrl || null,
						bio: other.profile.bio || null,
					}
				: null,
		};
	});

	// Optional search (case-insensitive) on displayName/name/email
	if (q) {
		const qq = q.toLowerCase();
		friends = friends.filter((f) => {
			const dn = f.profile?.displayName || "";
			const nm = f.name || "";
			const em = f.email || "";
			return (
				dn.toLowerCase().includes(qq) ||
				nm.toLowerCase().includes(qq) ||
				em.toLowerCase().includes(qq)
			);
		});
	}

	// Deduplicate just in case and cap to limit
	const seen = new Set();
	const result = [];
	for (const f of friends) {
		if (seen.has(f.id)) continue;
		seen.add(f.id);
		result.push(f);
		if (result.length >= limit) break;
	}

	return NextResponse.json(result);
}
