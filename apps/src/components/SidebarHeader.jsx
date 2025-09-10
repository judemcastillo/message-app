"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Pencil } from "lucide-react";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import NewGroupDialog from "./NewGroupDialog"; // ensure this is a client component

export default function SidebarHeader() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<div className="flex items-center justify-between p-3">
				<div className="text-2xl font-bold">Messages</div>
				<div className="flex items-center gap-2">
					{/* Open New Group modal */}
					<Button
						variant="outline"
						className="rounded-full shadow-6xl"
						onClick={() => setOpen(true)}
					>
						<Users />
					</Button>

					{/* New 1:1 chat */}
					<Button asChild variant="outline" className="rounded-full shadow-6xl">
						<Link href="/messages/new">
							<Pencil />
						</Link>
					</Button>
				</div>
			</div>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Create a group</DialogTitle>
					</DialogHeader>
					{/* NewGroupDialog should call your createGroupAction and can close on success */}
					<NewGroupDialog onCreated={() => setOpen(false)} />
				</DialogContent>
			</Dialog>
		</>
	);
}
