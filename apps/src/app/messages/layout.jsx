import { MessageSidebar } from "@/components/MessageSideBar";

export default async function RootLayout({ children }) {
	return (
		<>
			<div className="grid grid-cols-5">
				<MessageSidebar/>
				<div className="col-span-4">{children}</div>
			</div>
		</>
	);
}
