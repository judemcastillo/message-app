"use client";

import { logout } from "@/app/(auth)/actions";
import { Button } from "./ui/button";
import { useFormStatus } from "react-dom";

function Submit() {
	const { pending } = useFormStatus();
	return (
		<Button type="submit" variant="ghost" size="sm" disabled={pending}>
			{pending ? "Signing out..." : "Sign out"}
		</Button>
	);
}

export default function SignOutButton() {
	return (
		<form action={logout}>
			<Submit />
		</form>
	);
}
