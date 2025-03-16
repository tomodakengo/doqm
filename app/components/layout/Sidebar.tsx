"use client";

import {
	BarChart2,
	FileText,
	FolderTree,
	LayoutDashboard,
	Settings,
	Users,
} from "lucide-react";
import Link from "next/link";
import type { FC } from "react";

interface SidebarProps {
	className?: string;
}

const Sidebar: FC<SidebarProps> = ({ className = "" }) => {
	const menuItems = [
		{ icon: LayoutDashboard, label: "ダッシュボード", href: "/dashboard" },
		{ icon: FolderTree, label: "テストスイート", href: "/test-suites" },
		{ icon: FileText, label: "テストケース", href: "/test-cases" },
		{ icon: BarChart2, label: "レポート", href: "/reports" },
		{ icon: Users, label: "チーム", href: "/team" },
		{ icon: Settings, label: "設定", href: "/settings" },
	];

	return (
		<div
			className={`w-64 h-screen bg-white border-r border-gray-200 flex flex-col ${className}`}
		>
			<div className="p-6">
				<h1 className="text-xl font-bold text-gray-800">doqm</h1>
			</div>

			<nav className="flex-1 px-4">
				<ul className="space-y-1">
					{menuItems.map((item, index) => (
						<li key={index}>
							<Link
								href={item.href}
								className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
							>
								<item.icon className="w-5 h-5 mr-3" />
								<span>{item.label}</span>
							</Link>
						</li>
					))}
				</ul>
			</nav>

			<div className="p-4 border-t border-gray-200">
				<div className="flex items-center">
					<div className="w-8 h-8 rounded-full bg-gray-200" />
					<div className="ml-3">
						<p className="text-sm font-medium text-gray-700">ユーザー名</p>
						<p className="text-xs text-gray-500">user@example.com</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
