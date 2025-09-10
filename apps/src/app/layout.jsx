import "./globals.css";
import { getSession } from "@/lib/session";
import Link from "next/link";
import SignOutButton from "@/components/signout-button";

export const metadata = { title: "Messaging App" };

export default async function RootLayout({ children }) {
	const session = await getSession();
	const isAuthed = Boolean(session?.userId);
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className="bg-gray-100 max-h-screen  text-foreground antialiased h-full flex flex-col"
				suppressHydrationWarning
			>
				<header className="border-none max-w-screen w-full bg-white shadow-lg h-[7vh]">
					<nav className="max-w-5xl mx-auto p-3 flex items-center gap-4 ">
						<Link href="/">Home</Link>
						{isAuthed ? (
							<>
								<Link href="/messages">Messages</Link>
								<Link href="/profile">Profile</Link>
								<Link href="/discover">Discover</Link>
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
				<div className="h-[92vh]">{children}</div>
			</body>
		</html>
	);
}
