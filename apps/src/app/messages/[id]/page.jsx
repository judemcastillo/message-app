import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import Link from "next/link";
import ChatClient from "@/components/Chat-client";
import { Card } from "@/components/ui/card";

export default async function ThreadPage({ params: paramsPromise }) {
	const { id } = await paramsPromise; // Next 15: await params
	const { userId: me } = await requireUser(); // ensures logged-in

	// Load conversation directly
	const convo = await prisma.conversation.findUnique({
		where: { id },
		include: {
			participants: { include: { user: { include: { profile: true } } } },
			messages: { orderBy: { createdAt: "asc" }, take: 50 },
		},
	});

	// Not found or you’re not a participant
	if (!convo || !convo.participants.some((p) => p.userId === me)) {
		return (
			<div className="max-w-3xl mx-auto p-4">
				<p className="text-sm text-muted-foreground">Conversation not found.</p>
				<Link className="underline" href="/messages">
					Back to messages
				</Link>
			</div>
		);
	}

	const other = convo.participants.find((p) => p.userId !== me)?.user ?? null;
	const title =
		other?.profile?.displayName || other?.name || other?.email || "Chat";

	return (
		<Card className="p-5 mt-4 mx-3  mb-5">
			<div className="max-w-screen w-[100%]  space-y-3 ">
				<div className="flex items-center justify-between border-b-gray-200 border-b-2 pb-5">
					<h1 className="text-xl font-semibold">{title}</h1>
					<Link className="underline" href="/messages">
						All conversations
					</Link>
				</div>

				{/* Your client-side chat polls /api/... and will include cookies from the browser */}
				<ChatClient conversationId={id} meId={me} />
			</div>
		</Card>
	);
}
