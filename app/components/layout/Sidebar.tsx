"use client";

import { signOutAction } from "@/app/actions";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart2,
  Building2Icon,
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
  tenantId?: string;
}

const Sidebar: FC<SidebarProps> = ({ className = "", tenantId }) => {
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
  }, [router, supabase.auth]);

  const handleSignOut = async () => {
    await signOutAction();
  };

  // テナントIDがない場合は、テナント選択画面に戻るリンクを表示
  if (!tenantId) {
    return (
      <aside
        className={`w-64 bg-white border-r border-gray-200 p-4 ${className}`}
      >
        <div className="flex flex-col h-full">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900">Doqm</h1>
            <p className="text-sm text-gray-500">テスト管理プラットフォーム</p>
          </div>
          <div className="flex-1">
            <nav className="space-y-1">
              <Link
                href="/tenants"
                className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
              >
                <Building2Icon className="w-5 h-5 mr-3 text-gray-500" />
                <span>テナント選択</span>
              </Link>
            </nav>
          </div>
          <div className="pt-4 mt-6 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            >
              <LogOut className="w-5 h-5 mr-3 text-gray-500" />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`w-64 bg-white border-r border-gray-200 p-4 ${className}`}
    >
      <div className="flex flex-col h-full">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">Doqm</h1>
          <p className="text-sm text-gray-500">テスト管理プラットフォーム</p>
        </div>
        <div className="flex-1">
          <nav className="space-y-1">
            <Link
              href={`/${tenantId}/dashboard`}
              className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            >
              <LayoutDashboard className="w-5 h-5 mr-3 text-gray-500" />
              <span>ダッシュボード</span>
            </Link>
            <Link
              href={`/${tenantId}/test-suites`}
              className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            >
              <FolderTree className="w-5 h-5 mr-3 text-gray-500" />
              <span>テストスイート</span>
            </Link>
            <Link
              href={`/${tenantId}/history`}
              className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            >
              <FileText className="w-5 h-5 mr-3 text-gray-500" />
              <span>変更履歴</span>
            </Link>
            <Link
              href={`/${tenantId}/team`}
              className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            >
              <Users className="w-5 h-5 mr-3 text-gray-500" />
              <span>チーム管理</span>
            </Link>
            <Link
              href={`/${tenantId}/settings`}
              className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            >
              <Settings className="w-5 h-5 mr-3 text-gray-500" />
              <span>設定</span>
            </Link>
          </nav>
        </div>
        <div className="pt-4 mt-6 border-t border-gray-200">
          <Link
            href="/tenants"
            className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 mb-2"
          >
            <Building2Icon className="w-5 h-5 mr-3 text-gray-500" />
            <span>テナント切替</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
          >
            <LogOut className="w-5 h-5 mr-3 text-gray-500" />
            <span>ログアウト</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
