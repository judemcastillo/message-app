"use client";

import useSWR from "swr";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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

	if (isLoading)
		return <p className="text-sm text-muted-foreground">Loading…</p>;
	if (!data.length)
		return (
			<Card className="p-4 text-sm text-muted-foreground">
				No conversations yet. Start one from{" "}
				<div className="flex flex-row gap-3 items-center">
					<Button>
						<Link href="/discover">Discover</Link>
					</Button>{" "}
					/{" "}
					<Button variant="outline">
						<Link href="/messages/new">New chat</Link>
					</Button>
				</div>
			</Card>
		);

	return (
		<ul className="divide-y w-full">
			{data.map((c) => {
				const title = c.other?.name ?? "Conversation";
				const initials = title.slice(0, 2).toUpperCase();
				return (
					<li key={c.id}>
						<Link
							href={`/messages/${c.id}`}
							className="flex items-center gap-3 p-3 hover:bg-muted/40"
						>
							<Avatar className="h-9 w-9">
								<AvatarImage src={c.other?.avatar || undefined} alt={title} />
								<AvatarFallback>{initials}</AvatarFallback>
							</Avatar>

							<div className="min-w-0 flex-1">
								<div className="flex items-center justify-between gap-2">
									<p className="font-medium truncate">{title}</p>
									<span className="text-xs text-muted-foreground shrink-0">
										{when(c.lastMessage?.createdAt ?? c.updatedAt)}
									</span>
								</div>
								<p className="text-sm text-muted-foreground truncate">
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
