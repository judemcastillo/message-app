"use client";

import { useEffect } from "react";
import { heartbeatAction } from "@/app/actions/presence";

export default function PresencePing() {
	useEffect(() => {
		const ping = () => heartbeatAction().catch(() => {});
		ping(); // initial
		const iv = setInterval(ping, 30_000); // every 30s
		const wake = () => ping();
		document.addEventListener("visibilitychange", wake);
		window.addEventListener("focus", wake);
		return () => {
			clearInterval(iv);
			document.removeEventListener("visibilitychange", wake);
			window.removeEventListener("focus", wake);
		};
	}, []);
	return null;
}
