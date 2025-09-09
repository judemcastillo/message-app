import Conversations from "./Conversations";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export function MessageSidebar() {
	return (
		<div className="bg-white mt-1 rounded-tr-lg min-h-screen  flex flex-col">
			<div className="flex-row justify-between flex items-center p-3">
				<div className=" text-2xl font-bold">Messages</div>
				<Link href="/messages/new">
					<Button variant="outline" className="rounded-full shadow-6xl">
						<Pencil />
					</Button>
				</Link>
			</div>
			<Conversations />
		</div>
	);
}
