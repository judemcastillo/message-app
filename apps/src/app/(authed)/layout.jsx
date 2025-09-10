import { MessageSidebar } from "@/components/MessageSideBar";
import PresencePing from "./PresencePing";

export default async function RootLayout({ children }) {
	return (
		
			<div className="grid grid-cols-5 relative h-[92vh]">
				<PresencePing/>
				<MessageSidebar className="shadow-lg"/>
				<div className="col-span-4">{children}</div>
			</div>
	
	);
}
