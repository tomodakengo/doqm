"use client";

import { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderTree,
  History,
  BarChart2,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    name: "ダッシュボード",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "テストスイート",
    path: "/test-suites",
    icon: FolderTree,
  },
  {
    name: "実行履歴",
    path: "/history",
    icon: History,
  },
  {
    name: "レポート",
    path: "/reports",
    icon: BarChart2,
  },
  {
    name: "設定",
    path: "/settings",
    icon: Settings,
  },
];

const Sidebar: FC = () => {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">doqm</h1>
      </div>
      <nav className="px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
