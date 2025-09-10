import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./ProfileForm";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
	const { userId } = await requireUser();
	const me = await prisma.user.findUnique({
		where: { id: userId },
		include: { profile: true },
	});

	const name = me?.profile?.displayName || me?.name || me?.email;
	const avatar = me?.profile?.avatarUrl || null;

	return (
		<div className="max-w-3xl mx-auto p-4 space-y-6">
			<div className="flex items-center gap-4 justify-between w-full">
				<div
					className="flex flex-row items-center"
				>
					<Avatar className="h-16 w-16 ">
						<AvatarImage src={avatar || undefined} alt={name || "Avatar"} />
						<AvatarFallback>
							{(name || "U").slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<div className="text-xl font-semibold truncate">{name}</div>
						<div className="text-sm text-muted-foreground truncate">
							{me?.email}
						</div>
					</div>
				</div>
				<Link href="/friends">
					<Button>Friends</Button>
				</Link>
			</div>

			<ProfileForm
				defaults={{
					displayName: me?.profile?.displayName || "",
					avatarUrl: me?.profile?.avatarUrl || "",
					bio: me?.profile?.bio || "",
				}}
			/>
		</div>
	);
}
