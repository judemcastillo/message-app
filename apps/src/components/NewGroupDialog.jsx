"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { createGroupAction } from "@/app/(authed)/messages/group-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import OnlineAvatar from "./online-avatar";

import { usePresence } from "@/app/hooks/usePresence";

const fetcher = (u) => fetch(u).then((r) => r.json());

export default function NewGroupDialog({ onCreated }) {
	const [title, setTitle] = useState("");
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState({});
	const [submitting, setSubmitting] = useState(false);
	const [err, setErr] = useState("");

	// Load friends (accepted friendships)
	const { data: friends = [], isLoading } = useSWR("/api/friends", fetcher);

	// Optional: presence (green dot) for friends list
	const friendIds = useMemo(() => friends.map((f) => f.id), [friends]);
	const { online: onlineMap = {} } = usePresence
		? usePresence(friendIds, 10_000)
		: { online: {} };

	const filtered = useMemo(() => {
		if (!query) return friends;
		const q = query.toLowerCase();
		return friends.filter((f) => {
			const dn = f.profile?.displayName || "";
			const nm = f.name || "";
			const em = f.email || "";
			return (
				dn.toLowerCase().includes(q) ||
				nm.toLowerCase().includes(q) ||
				em.toLowerCase().includes(q)
			);
		});
	}, [friends, query]);

	const toggle = (id) => setSelected((s) => ({ ...s, [id]: !s[id] }));

	async function onCreate(e) {
		e.preventDefault();
		setErr("");
		const memberIds = Object.keys(selected).filter((id) => selected[id]);

		if (memberIds.length === 0) {
			setErr("Select at least one friend to start a group.");
			return;
		}

		setSubmitting(true);
		// This server action redirects to `/messages/:id` on success
		await createGroupAction({
			title: title.trim(),
			memberIds,
			avatarUrl: null,
		});
		// If your action does NOT redirect, you can close the dialog:
		onCreated?.();

		setSubmitting(false);
	}

	return (
		<form onSubmit={onCreate} className="space-y-3">
			{err ? (
				<div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
					{err}
				</div>
			) : null}

			<Input
				placeholder="Group name"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
			/>

			<Input
				placeholder="Search friends…"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
			/>

			<div className="text-xs text-muted-foreground">
				{isLoading ? "Loading friends…" : `Friends: ${filtered.length}`}
			</div>

			<ScrollArea className="max-h-64 w-full rounded-md border p-1">
				<ul className="space-y-1">
					{filtered.map((f) => {
						const name = f.profile?.displayName || f.name || f.email;
						const avatar = f.profile?.avatarUrl || null;
						const isOn = !!onlineMap[f.id]; // remove if not using presence
						const checked = !!selected[f.id];

						return (
							<li key={f.id}>
								<label className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted/60">
									<input
										type="checkbox"
										checked={checked}
										onChange={() => toggle(f.id)}
										className="mt-0.5"
									/>
									{OnlineAvatar ? (
										<OnlineAvatar
											src={avatar}
											name={name}
											online={isOn}
											size="h-8 w-8"
										/>
									) : (
										// Fallback avatar if you remove OnlineAvatar
										<div className="h-8 w-8 rounded-full bg-gray-200 grid place-items-center text-[10px] font-medium">
											{name.slice(0, 2).toUpperCase()}
										</div>
									)}
									<div className="min-w-0">
										<div className="truncate text-sm font-medium">{name}</div>
										<div className="truncate text-xs text-muted-foreground">
											{f.email}
										</div>
									</div>
								</label>
							</li>
						);
					})}
					{!isLoading && filtered.length === 0 ? (
						<li className="p-2 text-sm text-muted-foreground">No matches</li>
					) : null}
				</ul>
			</ScrollArea>

			<Button type="submit" className="w-full" disabled={submitting}>
				{submitting ? "Creating…" : "Create group"}
			</Button>
		</form>
	);
}
