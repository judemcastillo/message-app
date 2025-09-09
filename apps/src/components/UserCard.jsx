import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AddFriendButton from "@/components/AddFriendButton";

export default function UserCard({ user, status }) {
	const name =
		user.profile?.displayName || user.name || user.email.split("@")[0];
	const bio = user.profile?.bio || "—";
	const avatar = user.profile?.avatarUrl;

	return (
		<Card className="flex flex-col p-5 aspect-3/3">
			<CardHeader className="flex-col items-center gap-3 justify-center flex">
				<Avatar className=" border-none size-12">
					<AvatarImage src={avatar || undefined} alt={name} />
					<AvatarFallback className="bg-gray-300">
						{name.slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<div className="min-w-0 text-center">
					<Link
						href={`/u/${user.id}`}
						className="font-medium hover:underline block truncate"
					>
						{name}
					</Link>
					<p className="text-xs text-muted-foreground truncate">{user.email}</p>
				</div>
			</CardHeader>
			<CardContent className="flex-1 flex items-end justify-between gap-2">
				<p className="text-sm text-muted-foreground line-clamp-2">{bio}</p>
			</CardContent>
			<div className="">
				<AddFriendButton otherId={user.id} status={status} />
			</div>
		</Card>
	);
}
