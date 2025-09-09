"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfile } from "./actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

function SubmitBtn({ label }) {
	const { pending } = useFormStatus();
	return (
		<Button type="submit" disabled={pending}>
			{pending ? "Saving…" : label}
		</Button>
	);
}

export default function ProfileForm({ defaults }) {
	const [state, action] = useActionState(updateProfile, {});
	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{state?.errors?._form?.length ? (
					<p className="text-sm text-destructive">{state.errors._form[0]}</p>
				) : null}

				<form action={action} className="space-y-3">
					<div>
						<Input
							name="displayName"
							placeholder="Display name"
							defaultValue={defaults.displayName || ""}
							required
						/>
						{state?.errors?.displayName?.[0] && (
							<p className="text-xs text-destructive mt-1">
								{state.errors.displayName[0]}
							</p>
						)}
					</div>

					<div>
						<Input
							name="avatarUrl"
							placeholder="Avatar URL (https://…)"
							defaultValue={defaults.avatarUrl || ""}
						/>
						{state?.errors?.avatarUrl?.[0] && (
							<p className="text-xs text-destructive mt-1">
								{state.errors.avatarUrl[0]}
							</p>
						)}
					</div>

					<div>
						<Textarea
							name="bio"
							rows={5}
							placeholder="Tell people about you…"
							defaultValue={defaults.bio || ""}
						/>
						{state?.errors?.bio?.[0] && (
							<p className="text-xs text-destructive mt-1">
								{state.errors.bio[0]}
							</p>
						)}
					</div>

					<SubmitBtn label="Save profile" />
				</form>
			</CardContent>
		</Card>
	);
}
