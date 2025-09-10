"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { startConversation } from "@/app/(authed)/messages/new/actions";

function Submit({ label }) {
	const { pending } = useFormStatus();
	return (
		<Button type="submit" size="sm" disabled={pending}>
			{pending ? "…" : label}
		</Button>
	);
}

export default function MessageUserButton({ otherId, label = "Message" }) {
	return (
		<form action={startConversation.bind(null, otherId)}>
			<Submit label={label} />
		</form>
	);
}
