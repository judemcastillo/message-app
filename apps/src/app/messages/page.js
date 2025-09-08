import { requireUser } from "@/lib/auth-helpers";

import MessagesIndex from "@/components/Messages";

export default async function MessagesPage() {
	await requireUser();

	return (
		<div className="max-w-3xl mx-auto p-4 space-y-4">
			<MessagesIndex />
		</div>
	);
}
