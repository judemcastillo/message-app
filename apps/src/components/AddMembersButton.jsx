// src/components/AddMembersButton.jsx
"use client";

import { useMemo, useState, useTransition } from "react";
import useSWR, { mutate } from "swr";
import { addMembersAction } from "@/app/(authed)/messages/group-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import OnlineAvatar from "@/components/online-avatar"; // or your Avatar fallback

const fetcher = (u) => fetch(u).then((r) => r.json());

export default function AddMembersButton({
	conversationId,
	existingMemberIds = [],
	className = "",
}) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [picked, setPicked] = useState({});
	const [isPending, startTransition] = useTransition();

	const { data: friends = [] } = useSWR("/api/friends", fetcher);

	const candidates = useMemo(() => {
		const ignore = new Set(existingMemberIds);
		const base = friends.filter((f) => !ignore.has(f.id));
		if (!query) return base;
		const q = query.toLowerCase();
		return base.filter((f) => {
			const name = f.profile?.displayName || f.name || f.email || "";
			return (
				name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q)
			);
		});
	}, [friends, existingMemberIds, query]);

	const toggle = (id) => setPicked((s) => ({ ...s, [id]: !s[id] }));

	function submit() {
		const memberIds = Object.keys(picked).filter((id) => picked[id]);
		if (!memberIds.length) {
			setOpen(false);
			return;
		}
		startTransition(async () => {
			try {
				await addMembersAction(conversationId, memberIds);
				// refresh sidebar list if needed
				mutate("/api/conversations");
				setOpen(false);
				setPicked({});
			} catch (e) {
				console.error(e);
			}
		});
	}

	return (
		<>
			<Button
				variant="outline"
				className={className}
				onClick={() => setOpen(true)}
			>
				Add members
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Add members</DialogTitle>
					</DialogHeader>

					<Input
						placeholder="Search friends…"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="mb-2"
					/>

					<ScrollArea className="max-h-64 rounded border">
						<ul className="p-1 space-y-1">
							{candidates.map((f) => {
								const name = f.profile?.displayName || f.name || f.email;
								const checked = !!picked[f.id];
								return (
									<li key={f.id}>
										<label className="flex cursor-pointer items-center gap-3 rounded p-2 hover:bg-muted/60">
											<input
												type="checkbox"
												checked={checked}
												onChange={() => toggle(f.id)}
											/>
											<OnlineAvatar
												src={f.profile?.avatarUrl || undefined}
												name={name}
												online={false}
												size="h-8 w-8"
											/>
											<div className="min-w-0">
												<div className="truncate text-sm font-medium">
													{name}
												</div>
												<div className="truncate text-xs text-muted-foreground">
													{f.email}
												</div>
											</div>
										</label>
									</li>
								);
							})}
							{!candidates.length && (
								<li className="p-2 text-sm text-muted-foreground">
									No friends to add.
								</li>
							)}
						</ul>
					</ScrollArea>

					<div className="mt-3 flex justify-end gap-2">
						<Button variant="ghost" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button onClick={submit} disabled={isPending}>
							{isPending ? "Adding…" : "Add"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
