"use client";

import { getUserTenantsAction } from "@/app/actions/tenant";
import MainLayout from "@/app/components/layout/MainLayout";
import { Button } from "@/app/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/app/components/ui/card";
import { formatDate } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Tenant {
	id: string;
	name: string;
	description: string;
	plan: string;
	created_at: string;
}

interface TenantUser {
	id: string;
	role: string;
	joined_at: string;
	tenants: Tenant;
}

export default function TenantsPage() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [tenants, setTenants] = useState<TenantUser[]>([]);

	// テナント一覧を取得
	const fetchTenants = async () => {
		try {
			setLoading(true);
			setError(null);

			const result = await getUserTenantsAction();
			if (!result.success) {
				setError(result.error);
				return;
			}

			setTenants(result.data);
		} catch (error: any) {
			console.error("テナント一覧取得エラー:", error);
			setError(error.message || "テナント一覧の取得中にエラーが発生しました");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTenants();
	}, []);

	// 役割に応じたバッジのスタイルを返す
	const getRoleBadgeStyle = (role: string) => {
		switch (role) {
			case "admin":
				return "bg-red-100 text-red-800";
			case "manager":
				return "bg-blue-100 text-blue-800";
			case "user":
				return "bg-green-100 text-green-800";
			case "guest":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	// 役割の日本語名を返す
	const getRoleName = (role: string) => {
		switch (role) {
			case "admin":
				return "管理者";
			case "manager":
				return "マネージャー";
			case "user":
				return "ユーザー";
			case "guest":
				return "ゲスト";
			default:
				return role;
		}
	};

	// プランのバッジスタイルを返す
	const getPlanBadgeStyle = (plan: string) => {
		switch (plan) {
			case "premium":
				return "bg-purple-100 text-purple-800";
			case "standard":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	// プラン名を日本語に変換
	const getPlanName = (plan: string) => {
		switch (plan) {
			case "premium":
				return "プレミアム";
			case "standard":
				return "スタンダード";
			default:
				return "ベーシック";
		}
	};

	return (
		<MainLayout>
			<div className="space-y-6">
				{/* ヘッダー部分 */}
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">テナント一覧</h1>
						<p className="text-gray-600 mt-1">
							所属しているテナントの一覧と管理
						</p>
					</div>
					<Link href="/tenants/new">
						<Button>
							<LucideIcons.Plus className="w-5 h-5 mr-2" />
							テナント作成
						</Button>
					</Link>
				</div>

				{/* メインコンテンツ */}
				{loading ? (
					<div className="flex justify-center items-center py-12">
						<LucideIcons.Loader2 className="w-8 h-8 animate-spin text-gray-400" />
					</div>
				) : error ? (
					<div className="bg-red-50 p-6 rounded-lg text-red-600">
						<div className="flex items-center">
							<LucideIcons.AlertCircle className="w-6 h-6 mr-2" />
							<p>{error}</p>
						</div>
						<Button
							variant="outline"
							className="mt-4"
							onClick={() => fetchTenants()}
						>
							再読み込み
						</Button>
					</div>
				) : tenants.length === 0 ? (
					<div className="bg-gray-50 p-12 rounded-lg text-center">
						<LucideIcons.Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
						<h2 className="text-xl font-semibold text-gray-900 mb-2">
							テナントがありません
						</h2>
						<p className="text-gray-600 mb-6">
							新しいテナントを作成して、テストスイートの管理を始めましょう
						</p>
						<Link href="/tenants/new">
							<Button>
								<LucideIcons.Plus className="w-5 h-5 mr-2" />
								テナント作成
							</Button>
						</Link>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{tenants.map((tenantUser) => (
							<Card key={tenantUser.id} className="overflow-hidden">
								<CardHeader className="pb-4">
									<div className="flex justify-between items-start">
										<CardTitle className="text-xl">
											{tenantUser.tenants.name}
										</CardTitle>
										<div className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
											<span
												className={`px-2 py-1 rounded text-xs font-medium ${getPlanBadgeStyle(
													tenantUser.tenants.plan,
												)}`}
											>
												{getPlanName(tenantUser.tenants.plan)}
											</span>
										</div>
									</div>
									<CardDescription>
										{tenantUser.tenants.description || "説明なし"}
									</CardDescription>
								</CardHeader>
								<CardContent className="pb-4">
									<div className="mt-2 flex items-center">
										<span
											className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeStyle(
												tenantUser.role,
											)}`}
										>
											{getRoleName(tenantUser.role)}
										</span>
										<span className="text-xs text-gray-500 ml-2">
											{formatDate(tenantUser.joined_at)} に参加
										</span>
									</div>
								</CardContent>
								<CardFooter className="bg-gray-50 border-t border-gray-100 pt-3 pb-3 flex justify-end">
									<Link href={`/tenants/${tenantUser.tenants.id}`}>
										<Button variant="outline" size="sm">
											<LucideIcons.ArrowRight className="w-4 h-4 mr-1" />
											詳細を表示
										</Button>
									</Link>
								</CardFooter>
							</Card>
						))}
					</div>
				)}
			</div>
		</MainLayout>
	);
}
