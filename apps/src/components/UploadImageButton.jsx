"use client";

import { useActionState, useEffect, useRef } from "react";
import { uploadImage } from "@/app/(authed)/messages/[id]/actions";
import { CirclePlus,Image } from "lucide-react";

export default function UploadImageButton({ conversationId, onUploaded }) {
	const fileRef = useRef(null);
	const [state, act] = useActionState(
		(prev, fd) => uploadImage(conversationId, prev, fd),
		{ ok: false, errors: null }
	);

	useEffect(() => {
		if (state?.ok && onUploaded) onUploaded();
	}, [state?.ok, onUploaded]);

	return (
		<form action={act} className="contents">
			<input
				ref={fileRef}
				type="file"
				name="file"
				accept="image/*"
				className="hidden"
				onChange={(e) =>
					e.currentTarget.files?.length && e.currentTarget.form?.requestSubmit()
				}
			/>

			<Image
				onClick={() => fileRef.current?.click()}
				className="hover:text-gray-500 cursor-pointer size-6"
			/>
		</form>
	);
}
