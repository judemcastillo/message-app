import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { startConversation } from "./actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function NewChatPage() {
	const { userId: me } = await requireUser();

	// accepted friends for me
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
	});

	const friends = rows.map((r) => {
		const other = r.requesterId === me ? r.addressee : r.requester;
		return {
			id: other.id,
			name: other.profile?.displayName || other.name || other.email,
			email: other.email,
		};
	});

	return (
		<div className="max-w-3xl mx-auto p-4">
			<Card>
				<CardHeader>
					<CardTitle>Start a new chat</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{friends.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							You have no friends yet. Go to{" "}
							<a href="/discover" className="underline">
								Discover
							</a>{" "}
							to add some.
						</p>
					) : (
						friends.map((f) => (
							<form
								key={f.id}
								action={startConversation.bind(null, f.id)}
								className="flex items-center gap-3"
							>
								<div className="flex-1">
									<div className="font-medium">{f.name}</div>
									<div className="text-xs text-muted-foreground">{f.email}</div>
								</div>
								<Button type="submit" size="sm">
									Message
								</Button>
							</form>
						))
					)}
				</CardContent>
			</Card>
		</div>
	);
}
