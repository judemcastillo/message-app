import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import clsx from "clsx";

/**
 * OnlineAvatar
 * - src: avatar URL
 * - name: used for alt + 2-letter fallback
 * - online: boolean → green when true, gray when false
 * - size: tailwind size classes (e.g., "h-10 w-10")
 */
export default function OnlineAvatar({
	src,
	name = "",
	online = false,
	size = "h-10 w-10",
	className = "",
	dotClassName = "",
	ringClassName = "ring-2 ring-white", // or ring-background if dark header
}) {
	const initials =
		name
			?.trim()
			?.split(/\s+/)
			.slice(0, 2)
			.map((p) => p[0]?.toUpperCase())
			.join("") || "??";

	return (
		<div className={clsx("relative inline-block", className)}>
			<Avatar className={clsx("rounded-full object-cover", size)}>
				<AvatarImage src={src || undefined} alt={name} />
				<AvatarFallback className="text-xs font-medium">
					{initials}
				</AvatarFallback>
			</Avatar>

			<span
				aria-label={online ? "Online" : "Offline"}
				title={online ? "Online" : "Offline"}
				className={clsx(
					"absolute right-0 bottom-1 rounded-full", // position dot
					"h-2.5 w-2.5", // dot size
					online ? "bg-green-500" : "bg-gray-400",
					ringClassName,
					dotClassName
				)}
			/>
		</div>
	);
}
