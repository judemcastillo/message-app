"use client";

import { useState } from "react";

import {
	renameGroupAction,
	leaveGroupAction,
	addMembersAction,
} from "../group-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTransition } from "react";
import AddMembersButton from "@/components/AddMembersButton";
import ViewMembersButton from "@/components/ViewMembersButton";


export default function GroupHeader({ conversationId, title, members }) {
	const [name, setName] = useState(title || "");
	const [isPending, startTransition] = useTransition();

	const memberIds = members?.map((m) => m.id) ?? [];
	const canKick = true; // or compute from roles when you add them

	return (
		<div className="flex items-center gap-2 border-b p-3">
			<Input
				className="max-w-xs"
				value={name}
				onChange={(e) => setName(e.target.value)}
			/>
			<Button
				variant="outline"
				disabled={isPending || (name || "").trim() === (title || "").trim()}
				onClick={() =>
					startTransition(() => renameGroupAction(conversationId, name))
				}
			>
				Rename
			</Button>

			<AddMembersButton
				conversationId={conversationId}
				existingMemberIds={memberIds}
			/>
			<ViewMembersButton
				conversationId={conversationId}
				members={members}
				canKick={canKick}
			/>

			<div className="ml-auto">
				<Button
					variant="destructive"
					disabled={isPending}
					onClick={() =>
						startTransition(() => leaveGroupAction(conversationId))
					}
				>
					Leave group
				</Button>
			</div>
		</div>
	);
}
