"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { register } from "@/app/(auth)/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import clsx from "clsx";

const initialState = { errors: null };

function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<Button type="submit" className="w-full" disabled={pending}>
			{pending ? "Creating Account..." : "Submit"}
		</Button>
	);
}

export default function RegisterForm() {
	const [state, formAction, isPending] = useActionState(register, initialState);

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Create account</CardTitle>
			</CardHeader>
			<CardContent>
				{/* Top-level form error */}
				{state?.errors?._form?.length ? (
					<div className="mb-3 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
						{state.errors._form[0]}
					</div>
				) : null}

				<form action={formAction} className="space-y-4">
					<div>
						<Input
							name="name"
							placeholder="Name"
							required
							aria-invalid={Boolean(state?.errors?.name)}
							aria-describedby="name-error"
							className={clsx(
								state?.errors?.name &&
									"border-destructive focus-visible:ring-destructive"
							)}
						/>
						{state?.errors?.name?.length ? (
							<p id="name-error" className="mt-1 text-xs text-destructive">
								{state.errors.name[0]}
							</p>
						) : null}
					</div>

					<div>
						<Input
							name="email"
							type="email"
							placeholder="Email"
							required
							aria-invalid={Boolean(state?.errors?.email)}
							aria-describedby="email-error"
							className={clsx(
								state?.errors?.email &&
									"border-destructive focus-visible:ring-destructive"
							)}
						/>
						{state?.errors?.email?.length ? (
							<p id="email-error" className="mt-1 text-xs text-destructive">
								{state.errors.email[0]}
							</p>
						) : null}
					</div>

					<div>
						<Input
							name="password"
							type="password"
							placeholder="Password (min 6)"
							required
							aria-invalid={Boolean(state?.errors?.password)}
							aria-describedby="password-error"
							className={clsx(
								state?.errors?.password &&
									"border-destructive focus-visible:ring-destructive"
							)}
						/>
						{state?.errors?.password?.length ? (
							<p id="password-error" className="mt-1 text-xs text-destructive">
								{state.errors.password[0]}
							</p>
						) : null}
					</div>

					<SubmitButton />
				</form>

				<p className="text-sm mt-4">
					Already have an account?{" "}
					<Link href="/login" className="underline">
						Log in
					</Link>
				</p>
			</CardContent>
		</Card>
	);
}
