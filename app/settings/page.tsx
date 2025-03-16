"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";

export default function SettingsPage() {
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [name, setName] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });
	const router = useRouter();
	const supabase = createClient();

	useEffect(() => {
		async function getUser() {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				router.push("/sign-in");
				return;
			}

			setUser(user);
			setName(user.user_metadata?.name || "");
			setLoading(false);
		}

		getUser();
	}, [router, supabase]);

	const updateProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSaving(true);

		try {
			const { error } = await supabase.auth.updateUser({
				data: { name },
			});

			if (error) throw error;

			setMessage({
				type: "success",
				text: "プロフィールが更新されました",
			});

			setTimeout(() => setMessage({ type: "", text: "" }), 3000);
		} catch (error: any) {
			setMessage({
				type: "error",
				text: error.message || "エラーが発生しました",
			});
		} finally {
			setIsSaving(false);
		}
	};

	if (loading) {
		return (
			<MainLayout>
				<div className="animate-pulse">
					<div className="h-8 w-64 bg-gray-200 rounded mb-6"></div>
					<div className="h-4 w-full max-w-md bg-gray-200 rounded mb-2"></div>
					<div className="h-4 w-full max-w-md bg-gray-200 rounded mb-4"></div>
					<div className="h-10 w-full max-w-md bg-gray-200 rounded mb-6"></div>
					<div className="h-10 w-32 bg-gray-200 rounded"></div>
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout>
			<div className="max-w-3xl mx-auto">
				<h1 className="text-2xl font-bold text-gray-900 mb-6">設定</h1>

				<div className="bg-white p-6 rounded-xl border border-gray-200">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						プロフィール設定
					</h2>

					{message.text && (
						<div
							className={`p-3 rounded-md mb-4 ${
								message.type === "success"
									? "bg-green-50 text-green-800"
									: "bg-red-50 text-red-800"
							}`}
						>
							{message.text}
						</div>
					)}

					<form onSubmit={updateProfile} className="space-y-4">
						<div>
							<Label htmlFor="email">メールアドレス</Label>
							<Input
								id="email"
								type="email"
								value={user?.email || ""}
								disabled
								className="max-w-md cursor-not-allowed opacity-70"
							/>
							<p className="text-xs text-gray-500 mt-1">
								メールアドレスの変更はできません
							</p>
						</div>

						<div>
							<Label htmlFor="name">名前</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="max-w-md"
							/>
						</div>

						<Button type="submit" disabled={isSaving} className="mt-2">
							{isSaving ? "保存中..." : "変更を保存"}
						</Button>
					</form>
				</div>

				<div className="bg-white p-6 rounded-xl border border-gray-200 mt-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						パスワード変更
					</h2>
					<p className="text-gray-600 mb-4">
						パスワードを変更するには、現在のパスワードを入力して新しいパスワードを設定してください。
					</p>
					<Button variant="outline">パスワード変更</Button>
				</div>
			</div>
		</MainLayout>
	);
}
