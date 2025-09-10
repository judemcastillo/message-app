"use client";
import useSWR from "swr";
import { presenceStatusAction } from "@/app/actions/presence";

// ids: string[]
export function usePresence(ids, refreshMs = 10_000) {
	const key = ids && ids.length ? ["presence", ...ids] : null;
	const { data, isLoading } = useSWR(key, () => presenceStatusAction(ids), {
		refreshInterval: refreshMs,
	});
	return { online: data?.online ?? {}, isLoading };
}
