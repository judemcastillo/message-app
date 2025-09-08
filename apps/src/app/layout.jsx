import "./globals.css";
import { getSession } from "@/lib/session";
import Link from "next/link";
import SignOutButton from "@/components/signout-button";

export const metadata = { title: "Messaging App" };

export default async function RootLayout({ children }) {
	const session = await getSession();
	const isAuthed = Boolean(session?.userId);
	return (
		<html lang="en">
			<body className="min-h-screen bg-background text-foreground">
				<header className="border-b">
					<nav className="max-w-5xl mx-auto p-3 flex items-center gap-4">
						<Link href="/">Home</Link>
						{isAuthed ? (
							<>
								<Link href="/messages">Messages</Link>
								<Link href="/profile">Profile</Link>
								<div className="ml-auto">
									<SignOutButton />
								</div>
							</>
						) : (
							<Link className="ml-auto underline" href="/login">
								Sign in
							</Link>
						)}
					</nav>
				</header>
				{children}
			</body>
		</html>
	);
}
