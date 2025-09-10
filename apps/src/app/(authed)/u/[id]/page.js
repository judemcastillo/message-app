// src/app/u/[id]/page.jsx
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { getFriendStatus } from "@/lib/friends";
import AddFriendButton from "@/components/AddFriendButton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import MessageUserButton from "@/components/MessageUserButton";

export default async function UserProfile({ params: paramsPromise }) {
	await requireUser(); // protect profile pages (optional)
	const { id } = await paramsPromise; // ← await params in Next 15

	const user = await prisma.user.findUnique({
		where: { id },
		include: { profile: true },
	});

	if (!user) {
		return (
			<div className="max-w-3xl mx-auto p-4">
				<p className="text-sm text-muted-foreground">User not found.</p>
				<Link className="underline" href="/discover">
					Back to Discover
				</Link>
			</div>
		);
	}

	const name =
		user.profile?.displayName || user.name || user.email.split("@")[0];

	// if you want the friend button here:
	const { userId: me } = await requireUser();
	const status = await getFriendStatus(me, user.id);

	return (
		<div className="max-w-3xl mx-auto p-4 space-y-4">
			<div className="flex items-center gap-4">
				<Avatar className="h-16 w-16">
					<AvatarImage src={user.profile?.avatarUrl || undefined} alt={name} />
					<AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
				</Avatar>
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold truncate">{name}</h1>
					<p className="text-sm text-muted-foreground truncate">{user.email}</p>
				</div>
				<div className="ml-auto">
					<AddFriendButton otherId={user.id} status={status} />
					<MessageUserButton otherId={user.id} />
				</div>
			</div>

			<div className="rounded-lg border p-4">
				<h2 className="font-medium mb-2">Bio</h2>
				<p className="text-sm text-muted-foreground whitespace-pre-wrap">
					{user.profile?.bio || "No bio yet."}
				</p>
			</div>

			<Link className="underline" href="/discover">
				← Back to Discover
			</Link>
		</div>
	);
}
