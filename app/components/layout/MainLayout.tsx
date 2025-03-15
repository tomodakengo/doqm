import type { FC, ReactNode } from "react";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
	children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
	return (
		<div className="flex min-h-screen bg-gray-50">
			<Sidebar />
			<main className="flex-1 p-8">
				<div className="max-w-7xl mx-auto">{children}</div>
			</main>
		</div>
	);
};

export default MainLayout;
