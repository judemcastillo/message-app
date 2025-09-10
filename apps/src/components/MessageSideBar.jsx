import Conversations from "./Conversations";
import SidebarHeader from "./SidebarHeader"; // client child below

export function MessageSidebar({ className = "" }) {
	return (
		<div
			className={`bg-white mt-1 rounded-tr-lg h-full flex flex-col grow-2 ${className}`}
		>
			<SidebarHeader />
			<Conversations />
		</div>
	);
}
