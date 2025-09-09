// src/app/friends/page.jsx
import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MessageUserButton from "@/components/MessageUserButton";

export const dynamic = "force-dynamic";

async function getData(userId) {
	const incoming = await prisma.friendship.findMany({
		where: { addresseeId: userId, status: "PENDING" },
		include: { requester: { include: { profile: true } } },
	});

	const friends = await prisma.friendship.findMany({
		where: {
			status: "ACCEPTED",
			OR: [{ requesterId: userId }, { addresseeId: userId }],
		},
		include: {
			requester: { include: { profile: true } },
			addressee: { include: { profile: true } },
		},
		orderBy: { createdAt: "desc" },
	});

	return { incoming, friends };
}

export default async function FriendsPage() {
	const { userId } = await requireUser();
	const { incoming, friends } = await getData(userId);

	return (
		<div className="max-w-3xl mx-auto p-4 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Friends</CardTitle>
				</CardHeader>
				<CardContent>
					{friends.length === 0 ? (
						<p className="text-sm text-muted-foreground">No friends yet.</p>
					) : (
						friends.map((f) => {
							const other =
								f.requesterId === userId ? f.addressee : f.requester;
							const name =
								other.profile?.displayName || other.name || other.email;
							return (
								<div
									key={f.id}
									className="text-sm flex flex-row justify-between p-2 items-center  mx-0 "
								>
									<div>{name}</div>
									<MessageUserButton otherId={f.requesterId} />
								</div>
							);
						})
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Incoming requests</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{incoming.length === 0 ? (
						<p className="text-sm text-muted-foreground">None right now.</p>
					) : (
						incoming.map((r) => {
							const name =
								r.requester.profile?.displayName ||
								r.requester.name ||
								r.requester.email;
							return (
								<div key={r.id} className="text-sm">
									{name} (pending)
								</div>
							);
						})
					)}
				</CardContent>
			</Card>
		</div>
	);
}
