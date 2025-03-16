"use client";

import { signOutAction } from "@/app/actions";
import { createClient } from "@/utils/supabase/client";
import {
	BarChart2,
	FileText,
	FolderTree,
	LayoutDashboard,
	LogOut,
	Settings,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FC, useEffect, useState } from "react";

interface SidebarProps {
	className?: string;
}

const Sidebar: FC<SidebarProps> = ({ className = "" }) => {
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const supabase = createClient();

	useEffect(() => {
		async function getUser() {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			setUser(user);
			setLoading(false);
		}

		getUser();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (event === "SIGNED_OUT") {
				router.push("/sign-in");
			} else if (event === "SIGNED_IN" && session) {
				setUser(session.user);
			}
		});

		return () => subscription.unsubscribe();
	}, [router, supabase]);

	const menuItems = [
		{ icon: LayoutDashboard, label: "ダッシュボード", href: "/dashboard" },
		{ icon: FolderTree, label: "テストスイート", href: "/test-suites" },
		{ icon: FileText, label: "テストケース", href: "/test-cases" },
		{ icon: BarChart2, label: "レポート", href: "/reports" },
		{ icon: Users, label: "チーム", href: "/team" },
		{ icon: Settings, label: "設定", href: "/settings" },
	];

	const handleSignOut = async () => {
		await signOutAction();
	};

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
				{loading ? (
					<div className="animate-pulse flex items-center">
						<div className="w-8 h-8 rounded-full bg-gray-200" />
						<div className="ml-3 space-y-1">
							<div className="h-2 w-24 bg-gray-200 rounded"></div>
							<div className="h-2 w-32 bg-gray-200 rounded"></div>
						</div>
					</div>
				) : user ? (
					<div className="flex flex-col space-y-2">
						<div className="flex items-center">
							<div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
								{user.email?.[0]?.toUpperCase() || "U"}
							</div>
							<div className="ml-3">
								<p className="text-sm font-medium text-gray-700">
									{user.user_metadata?.name || "ユーザー"}
								</p>
								<p className="text-xs text-gray-500">{user.email}</p>
							</div>
						</div>
						<button
							onClick={handleSignOut}
							className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors w-full"
						>
							<LogOut className="w-5 h-5 mr-3" />
							<span>ログアウト</span>
						</button>
					</div>
				) : (
					<Link
						href="/sign-in"
						className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
					>
						<span>ログイン</span>
					</Link>
				)}
			</div>
		</div>
	);
};

export default Sidebar;
