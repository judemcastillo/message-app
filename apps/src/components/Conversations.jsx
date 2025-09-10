"use client";

import useSWR from "swr";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "./ui/button";
import OnlineAvatar from "@/components/online-avatar"; // ensure path matches your file
import { usePresence } from "@/app/hooks/usePresence";

const fetcher = (u) => fetch(u).then((r) => r.json());

function when(ts) {
	if (!ts) return "";
	const d = new Date(ts);
	return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Conversations() {
	// Expect: [{ id, other: { id, name, profile? }, lastMessage?, updatedAt }]
	const { data = [], isLoading } = useSWR("/api/conversations", fetcher, {
		refreshInterval: 5000,
	});

	// gather the "other" user ids for presence lookup
	const otherIds = Array.from(
		new Set(data.map((c) => c?.other?.id).filter(Boolean))
	);

	const { online: onlineMap } = usePresence(otherIds); // { [userId]: boolean }

	if (isLoading)
		return <p className="text-sm text-muted-foreground">Loading…</p>;

	if (!data.length)
		return (
			<Card className="p-4 text-sm text-muted-foreground">
				No conversations yet. Start one from{" "}
				<div className="mt-2 flex items-center gap-3">
					<Button asChild>
						<Link href="/discover">Discover</Link>
					</Button>
					<span>/</span>
					<Button variant="outline" asChild>
						<Link href="/messages/new">New chat</Link>
					</Button>
				</div>
			</Card>
		);

	return (
		<ul className="w-full divide-y">
			{data.map((c) => {
				const title =
					c?.other?.profile?.displayName || c?.other?.name || "Conversation";
				const otherId = c?.other?.id;
				const isOnline = !!onlineMap?.[otherId];

				return (
					<li key={c.id}>
						<Link
							href={`/messages/${c.id}`}
							className="flex items-center gap-3 p-3 hover:bg-muted/40"
						>
							<OnlineAvatar
								src={c?.other?.profile?.avatarUrl}
								name={title}
								online={isOnline}
								size="h-10 w-10"
							/>

							<div className="min-w-0 flex-1">
								<div className="flex items-center justify-between gap-2">
									<p className="truncate font-medium">{title}</p>
									<span className="shrink-0 text-xs text-muted-foreground">
										{when(c.lastMessage?.createdAt ?? c.updatedAt)}
									</span>
								</div>
								<p className="truncate text-sm text-muted-foreground">
									{c.lastMessage?.content ?? "No messages yet"}
								</p>
							</div>
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
