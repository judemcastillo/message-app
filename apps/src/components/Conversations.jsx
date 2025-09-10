"use client";

import useSWR from "swr";
import Link from "next/link";
import OnlineAvatar from "./online-avatar";
import { Card } from "@/components/ui/card";
import { Button } from "./ui/button";

const fetcher = (u) => fetch(u).then((r) => r.json());

function when(ts) {
	if (!ts) return "";
	const d = new Date(ts);
	return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Conversations() {
	const { data = [], isLoading } = useSWR("/api/conversations", fetcher, {
		refreshInterval: 5000,
	});

	if (isLoading) {
		return <p className="text-sm text-muted-foreground">Loading…</p>;
	}
	if (!data.length) {
		return (
			<Card className="p-4 text-sm text-muted-foreground">
				No conversations yet. Start one from{" "}
				<div className="flex flex-row gap-3 items-center">
					<Button asChild>
						<Link href="/discover">Discover</Link>
					</Button>
					/
					<Button asChild variant="outline">
						<Link href="/messages/new">New chat</Link>
					</Button>
				</div>
			</Card>
		);
	}

	return (
		<ul className="divide-y w-full">
			{data.map((c) => {
				const isGroup = !!c.isGroup;
				const title = isGroup
					? c.title || "Group"
					: c.other?.name || "Conversation";

				const avatarSrc = isGroup ? c.groupAvatar : c.other?.avatar;
				// if you have presence, compute online map and pass a boolean here:
				const onlineBool = false;

				return (
					<li key={c.id}>
						<Link
							href={`/messages/${c.id}`}
							className="flex items-center gap-3 p-3 hover:bg-muted/40"
						>
							<OnlineAvatar
								src={avatarSrc || undefined}
								name={title}
								online={onlineBool}
								size="h-10 w-10"
							/>
							<div className="min-w-0 flex-1">
								<div className="flex items-center justify-between gap-2">
									<p className="font-medium truncate">{title}</p>
									<span className="text-xs text-muted-foreground shrink-0">
										{when(c.lastMessage?.createdAt ?? c.updatedAt)}
									</span>
								</div>
								<p className="text-sm text-muted-foreground truncate">
									{c.lastMessage?.imageUrl
										? "📷 Photo"
										: (c.lastMessage?.content ?? "No messages yet")}
								</p>
							</div>
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
