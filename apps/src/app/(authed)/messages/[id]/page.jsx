import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import Link from "next/link";
import ChatClient from "@/components/Chat-client";
import { Card } from "@/components/ui/card";
import GroupHeader from "./GroupHeader";

function nameOf(user) {
	return user?.profile?.displayName || user?.name || user?.email || "User";
}

function fallbackGroupTitle(participants, me) {
	const others = participants
		.filter((p) => p.userId !== me)
		.map((p) => nameOf(p.user));
	if (others.length <= 2) return others.join(", ") || "Group";
	return `${others[0]}, ${others[1]} +${others.length - 2}`;
}

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

	const headerTitle = convo.isGroup
		? convo.title || fallbackGroupTitle(convo.participants, me)
		: nameOf(convo.participants.find((p) => p.userId !== me)?.user);

	// For GroupHeader props (client component), pass only serializable fields
	const groupProps = convo.isGroup
		? {
				conversationId: convo.id,
				title: headerTitle,
				members: convo.participants.map((p) => ({
					id: p.user.id,
					name: nameOf(p.user),
					avatar: p.user.profile?.avatarUrl || null,
					role: p.role, // if you added roles
					isMe: p.userId === me,
				})),
			}
		: null;

	return (
		<Card className="p-5 mt-4 mx-3 h-[90vh]">
			<div className="max-w-screen w-[100%]  space-y-3 h-full flex flex-col justify-between">
				<div className="flex items-center justify-between border-b-gray-200 border-b-2 pb-5">
					<h1 className="text-xl font-semibold">{headerTitle}</h1>
					<Link className="underline" href="/messages">
						All conversations
					</Link>
				</div>
				<div>
					{convo.isGroup ? <GroupHeader {...groupProps} /> : null}

					{/* Your client-side chat polls /api/... and will include cookies from the browser */}
					<ChatClient conversationId={id} meId={me} />
				</div>
			</div>
		</Card>
	);
}
