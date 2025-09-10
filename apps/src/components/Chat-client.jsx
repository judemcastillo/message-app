"use client";

import useSWR from "swr";
import { useActionState, useEffect, useRef } from "react";
import { sendMessage } from "@/app/(authed)/messages/[id]/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import UploadImageButton from "./UploadImageButton";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function ChatClient({ conversationId, meId }) {
	const listKey =
		typeof conversationId === "string" && conversationId !== "new"
			? `/api/conversations/${conversationId}/messages`
			: null;

	const {
		data: messages = [],
		mutate,
		isLoading,
	} = useSWR(listKey, fetcher, {
		refreshInterval: 3000,
	});

	const endRef = useRef(null);
	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]);

	const formRef = useRef(null);
	const inputRef = useRef(null);

	const initial = { ok: false, errors: null };
	const [state, act, pending] = useActionState(async (prev, fd) => {
		const raw = String(fd.get("content") || "");
		const content = raw.trim();
		if (!content) return prev;

		// optimistic append
		const tempId = `optimistic-${Date.now()}`;
		const optimistic = {
			id: tempId,
			content,
			createdAt: new Date().toISOString(),
			sender: { profile: null, name: "You", email: "you" },
			__optimistic: true,
		};
		await mutate((old = []) => [...old, optimistic], { revalidate: false });

		// clear input immediately
		if (inputRef.current) inputRef.current.value = "";

		// send to server
		const res = await sendMessage(conversationId, prev, fd);

		if (!res?.ok) {
			// rollback on failure
			await mutate((old = []) => old.filter((m) => m.id !== tempId), {
				revalidate: false,
			});
			return {
				ok: false,
				errors: res?.errors ?? { _form: ["Failed to send"] },
			};
		}

		// revalidate to swap optimistic with real message
		await mutate();
		return { ok: true, errors: null };
	}, initial);

	function onKeyDown(e) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			formRef.current?.requestSubmit();
		}
	}

	return (
		<div className="flex flex-col h-[80vh] border-none rounded-b-xl bg-white">
			<div className="flex-1 overflow-y-auto p-3 space-y-2">
				{isLoading ? (
					<div className="text-sm text-muted-foreground">Loading…</div>
				) : null}
				{messages.map((m) => {
					const isMine = m.senderId === meId || m.__optimistic;
					return (
						<div
							key={m.id}
							className={`flex w-full ${isMine ? "justify-end" : "justify-start"}`}
						>
							<div className="flex flex-col gap-2 max-w-[70%]">
								<div className="text-xs text-muted-foreground">
									{m.sender?.profile?.displayName ||
										m.sender?.name ||
										m.sender?.email ||
										"You"}
								</div>
								<div
									key={m.id}
									className={`  rounded-lg px-3 py-2 ${
										m.__optimistic ? "bg-muted/80" : "bg-muted"
									}`}
								>
									{m.content}
									{m.imageUrl && (
										<a href={m.imageUrl} target="_blank" rel="noreferrer">
											<img
												src={m.imageUrl}
												alt="upload"
												className="mt-2 max-h-64 w-auto rounded-lg"
												loading="lazy"
											/>
										</a>
									)}
								</div>
							</div>
						</div>
					);
				})}
				<div ref={endRef} />
			</div>

			{state?.errors?._form?.length ? (
				<div className="px-3 py-2 text-sm text-destructive border-t">
					{state.errors._form[0]}
				</div>
			) : null}
			<div className="p-3 flex gap-2 border-t flex-row w-full justify-between pt-7 items-center">
				<UploadImageButton
					conversationId={conversationId}
					onUploaded={() => mutate()}
				/>

				<form ref={formRef} action={act} className="flex gap-2 w-full flex-2">
					<Input
						ref={inputRef}
						name="content"
						placeholder="Type a message…"
						autoComplete="off"
						onKeyDown={onKeyDown}
					/>
					<Button type="submit" disabled={pending}>
						{pending ? "Sending…" : "Send"}
					</Button>
				</form>
			</div>
		</div>
	);
}
