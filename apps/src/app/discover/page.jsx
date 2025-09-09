import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { getStatusesFor } from "@/lib/friends";
import UserCard from "@/components/UserCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic"; // keep fresh

export default async function DiscoverPage({ searchParams: spPromise }) {
	const { userId: me } = await requireUser();
	const sp = await spPromise;
	const q = (sp?.q || "").toString().trim();
	const take = 24;
	const page = Math.max(1, parseInt(sp?.page || "1", 10));
	const skip = (page - 1) * take;

	const where = {
		id: { not: me },
		...(q && {
			OR: [
				{ email: { contains: q, mode: "insensitive" } },
				{ name: { contains: q, mode: "insensitive" } },
				{
					profile: {
						is: { displayName: { contains: q, mode: "insensitive" } },
					},
				},
			],
		}),
	};

	const [users, total] = await Promise.all([
		prisma.user.findMany({
			where,
			include: { profile: true },
			orderBy: { createdAt: "desc" },
			take,
			skip,
		}),
		prisma.user.count({ where }),
	]);

	const statuses = await getStatusesFor(
		me,
		users.map((u) => u.id)
	);

	return (
		<div className="max-w-5xl mx-auto p-4 space-y-4">
			<div className="flex items-center gap-2">
				<form className="flex gap-2 w-full" action="/discover">
					<Input name="q" placeholder="Search people…" defaultValue={q} className="bg-white"/>
					<Button type="submit">Search</Button>
				</form>
				<Link href="/friends" className="underline">
					Friends
				</Link>
			</div>

			{users.length === 0 ? (
				<p className="text-sm text-muted-foreground">No users found.</p>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{users.map((u) => (
						<UserCard key={u.id} user={u} status={statuses[u.id]} />
					))}
				</div>
			)}

			{/* simple pagination */}
			{total > take && (
				<div className="flex justify-center gap-2 pt-2">
					{page > 1 && (
						<Link
							className="underline"
							href={`/discover?q=${encodeURIComponent(q)}&page=${page - 1}`}
						>
							Previous
						</Link>
					)}
					{skip + users.length < total && (
						<Link
							className="underline"
							href={`/discover?q=${encodeURIComponent(q)}&page=${page + 1}`}
						>
							Next
						</Link>
					)}
				</div>
			)}
		</div>
	);
}
