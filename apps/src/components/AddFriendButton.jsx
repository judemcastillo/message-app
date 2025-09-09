"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { requestFriend, acceptFriendFrom } from "@/app/discover/actions";

function Submit({ label }) {
	const { pending } = useFormStatus();
	return (
		<Button type="submit" size="sm" disabled={pending}>
			{pending ? "…" : label}
		</Button>
	);
}

/**
 * status: "none" | "pending_out" | "pending_in" | "accepted" | "blocked" | "self"
 */
export default function AddFriendButton({ otherId, status }) {
	if (status === "self") {
		return (
			<Button size="sm" variant="outline" disabled>
				It&apos;s you
			</Button>
		);
	}
	if (status === "accepted") {
		return (
			<Button size="sm" variant="outline" disabled>
				Friends
			</Button>
		);
	}
	if (status === "blocked") {
		return (
			<Button size="sm" variant="outline" disabled>
				Blocked
			</Button>
		);
	}
	if (status === "pending_out") {
		return (
			<Button size="sm" variant="outline" disabled>
				Requested
			</Button>
		);
	}
	if (status === "pending_in") {
		return (
			<form action={acceptFriendFrom.bind(null, otherId)}>
				<Submit label="Accept" />
			</form>
		);
	}
	// none
	return (
		<form action={requestFriend.bind(null, otherId)}>
			<Submit label="Add friend" />
		</form>
	);
}
