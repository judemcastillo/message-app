"use server";

import Link from "next/link";

async function getConversations() {
	const res = await fetch(`${process.env.NEXTAUTH_URL}/api/conversations`, { cache: "no-store" });
	return res.ok ? res.json() : [];
}

export default async function MessagesIndex() {
	const conversations = await getConversations();

	return (
		<div className="max-w-3xl mx-auto p-4 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Messages</h1>
				<Link href="/messages/new" className="underline">
					New chat
				</Link>
			</div>

			{conversations.length === 0 ? (
				<div className="rounded-xl border p-6 text-sm text-muted-foreground">
					You don’t have any conversations yet.{" "}
					<Link href="/messages/new" className="underline">
						Start a new chat
					</Link>
					.
				</div>
			) : (
				<ul className="space-y-2">
					{conversations.map((c) => {
						const last = c.messages?.[0];
						// pick *the other* participant for title (fallbacks included)
						const youIn = c.participants.find((p) => p.userId && p.userId); // list has all; pick other below
						const other =
							c.participants.find((p) => p.userId !== youIn?.userId)?.user ||
							c.participants[0]?.user;
						const title =
							other?.profile?.displayName || other?.name || other?.email;

						return (
							<li
								key={c.id}
								className="border rounded-xl p-3 hover:bg-muted/30"
							>
								<Link href={`/messages/${c.id}`}>
									<div className="font-medium">{title}</div>
									<div className="text-sm text-muted-foreground truncate">
										{last?.content || "No messages yet"}
									</div>
								</Link>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
