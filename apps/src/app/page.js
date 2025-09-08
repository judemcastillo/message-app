import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";

export default async function Home() {
	const session = await getSession();
	if (session?.user) redirect("/messages");
	return (
		<main className="min-h-screen flex items-center justify-center p-6">
			<div className="space-y-3 text-center">
				<h1 className="text-3xl font-semibold">Messaging App</h1>
				<p className="text-muted-foreground">Sign in to start chatting</p>
				<div className="flex items-center justify-center gap-3">
					<Link className="underline" href="/login">
						<Button variant="outline">Log in</Button>
					</Link>
					<span>·</span>
					<Link className="underline" href="/register">
						Register
					</Link>
				</div>
			</div>
		</main>
	);
}
