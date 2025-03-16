"use client";

import { acceptInvitationAction } from "@/app/actions/tenant";
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
import * as LucideIcons from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AcceptInvitationPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [tenantId, setTenantId] = useState<string | null>(null);

	useEffect(() => {
		if (!token) {
			setError("招待トークンが見つかりません。");
			return;
		}

		const acceptInvitation = async () => {
			try {
				setLoading(true);
				setError(null);

				const result = await acceptInvitationAction(token);
				if (!result.success) {
					setError(result.error);
					return;
				}

				setSuccess(true);
				setTenantId(result.data.tenantId);
			} catch (error: any) {
				console.error("招待受け入れエラー:", error);
				setError(error.message || "招待の受け入れ中にエラーが発生しました");
			} finally {
				setLoading(false);
			}
		};

		acceptInvitation();
	}, [token]);

	return (
		<MainLayout>
			<div className="max-w-md mx-auto py-12">
				<Card>
					<CardHeader>
						<CardTitle>テナント招待</CardTitle>
						<CardDescription>
							テナントへの招待の受け入れステータス
						</CardDescription>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="flex flex-col items-center justify-center py-8">
								<LucideIcons.Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
								<p className="text-gray-600">招待を処理しています...</p>
							</div>
						) : error ? (
							<div className="bg-red-50 p-4 rounded-md text-red-600 flex items-start">
								<LucideIcons.AlertTriangle className="w-5 h-5 mr-2 mt-0.5" />
								<div>
									<p className="font-medium">招待の受け入れに失敗しました</p>
									<p className="text-sm mt-1">{error}</p>
								</div>
							</div>
						) : success ? (
							<div className="bg-green-50 p-4 rounded-md text-green-700 flex items-start">
								<LucideIcons.CheckCircle className="w-5 h-5 mr-2 mt-0.5" />
								<div>
									<p className="font-medium">招待を受け入れました</p>
									<p className="text-sm mt-1">
										テナントに正常に参加しました。ダッシュボードでテナントにアクセスできます。
									</p>
								</div>
							</div>
						) : (
							<div className="flex justify-center py-8">
								<p className="text-gray-500">招待情報を読み込んでいます...</p>
							</div>
						)}
					</CardContent>
					<CardFooter className="flex justify-center">
						{success ? (
							<div className="space-x-4">
								<Button
									onClick={() => router.push(`/tenants/${tenantId}`)}
									className="w-full"
									disabled={loading}
								>
									<LucideIcons.ExternalLink className="w-4 h-4 mr-2" />
									テナントを表示
								</Button>
							</div>
						) : (
							<Button
								variant="outline"
								onClick={() => router.push("/dashboard")}
								disabled={loading}
							>
								<LucideIcons.ArrowLeft className="w-4 h-4 mr-2" />
								ダッシュボードに戻る
							</Button>
						)}
					</CardFooter>
				</Card>
			</div>
		</MainLayout>
	);
}
