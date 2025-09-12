// src/components/ViewMembersButton.jsx
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import OnlineAvatar from "@/components/online-avatar"; // or your Avatar fallback
import { removeMemberAction } from "@/app/(authed)/messages/group-actions";

export default function ViewMembersButton({
	conversationId,
	members = [], // [{ id, name, avatar, isMe }]
	canKick = true, // toggle permission UI if you like
	className = "",
}) {
	const [open, setOpen] = useState(false);
	const [pendingId, startTransition] = useTransition();

	function kick(id) {
		startTransition(async () => {
			try {
				await removeMemberAction(conversationId, id);
				// Page will revalidate; you can also optimistically hide the row if you prefer
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
				View members
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Members ({members.length})</DialogTitle>
					</DialogHeader>

					<ScrollArea className="max-h-72 rounded border">
						<ul className="p-1 space-y-1">
							{members.map((m) => (
								<li
									key={m.id}
									className="flex items-center gap-3 justify-between rounded p-2 hover:bg-muted/60"
								>
									<div className="flex items-center gap-3 min-w-0">
										<OnlineAvatar
											src={m.avatar || undefined}
											name={m.name}
											online={false /* hook your presence here if you want */}
											size="h-8 w-8"
										/>
										<div className="min-w-0">
											<div className="truncate text-sm font-medium">
												{m.name}{" "}
												{m.isMe ? (
													<span className="text-xs text-muted-foreground">
														(you)
													</span>
												) : null}
											</div>
										</div>
									</div>

									{canKick && !m.isMe ? (
										<Button
											size="sm"
											variant="destructive"
											onClick={() => kick(m.id)}
											disabled={!!pendingId}
										>
											Kick
										</Button>
									) : (
										<div className="w-[60px]" /> // spacer for layout
									)}
								</li>
							))}
							{!members.length && (
								<li className="p-2 text-sm text-muted-foreground">
									No members
								</li>
							)}
						</ul>
					</ScrollArea>

					<div className="mt-3 flex justify-end">
						<Button variant="ghost" onClick={() => setOpen(false)}>
							Close
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
