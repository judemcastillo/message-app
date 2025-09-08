"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/app/(auth)/actions";

const initialState = { errors: null };

function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<Button type="submit" className="w-full" disabled={pending}>
			{pending ? "Signing in..." : "Sign in"}
		</Button>
	);
}

export default function LoginForm() {
	const [state, formAction, isPending] = useActionState(login, initialState);

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Log in</CardTitle>
			</CardHeader>
			<CardContent>
				<form action={formAction} className="space-y-4">
					<div>
						<Input type="email" placeholder="Email" name="email" required />
						{state?.errors?.email?.length ? (
							<p className="text-red-500 text-sm mt-1">
								{state.errors.email[0]}
							</p>
						) : null}
					</div>

					<div>
						<Input
							type="password"
							placeholder="Password"
							name="password"
							required
						/>
						{state?.errors?.password?.length ? (
							<p className="text-red-500 text-sm mt-1">
								{state.errors.password[0]}
							</p>
						) : null}
					</div>

					<SubmitButton />
				</form>

				<p className="text-sm text-muted-foreground mt-4">
					New here?{" "}
					<Link className="underline" href="/register">
						Create an account
					</Link>
				</p>
			</CardContent>
		</Card>
	);
}
