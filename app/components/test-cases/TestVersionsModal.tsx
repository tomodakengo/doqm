import { Button } from "@/app/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/app/components/ui/dialog";
import { getTestCaseVersions } from "@/lib/api/supabase";
import { formatDate } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { useEffect, useState } from "react";

interface TestVersionsModalProps {
	isOpen: boolean;
	onClose: () => void;
	testCaseId: string;
}

interface TestCaseVersion {
	id: string;
	test_case_id: string;
	version: string;
	title: string;
	description: string | null;
	preconditions: string | null;
	steps: string[] | null;
	expected_result: string | null;
	priority: string | null;
	created_by: string | null;
	created_at: string;
}

const TestVersionsModal: React.FC<TestVersionsModalProps> = ({
	isOpen,
	onClose,
	testCaseId,
}) => {
	const [versions, setVersions] = useState<TestCaseVersion[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedVersion, setSelectedVersion] =
		useState<TestCaseVersion | null>(null);

	useEffect(() => {
		if (isOpen && testCaseId) {
			loadVersions();
		}
	}, [isOpen, testCaseId]);

	const loadVersions = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await getTestCaseVersions(testCaseId);
			setVersions(data);
			if (data.length > 0) {
				setSelectedVersion(data[0]);
			}
		} catch (err) {
			console.error("バージョン履歴の取得エラー", err);
			setError("バージョン履歴の取得中にエラーが発生しました");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold flex items-center">
						<LucideIcons.History className="w-5 h-5 mr-2" />
						テストケースのバージョン履歴
					</DialogTitle>
					<DialogDescription>
						テストケースの変更履歴と各バージョンの詳細を確認できます
					</DialogDescription>
				</DialogHeader>

				{loading ? (
					<div className="flex justify-center items-center py-8">
						<LucideIcons.Loader2 className="w-8 h-8 animate-spin text-gray-400" />
					</div>
				) : error ? (
					<div className="bg-red-50 p-4 rounded-md text-red-600">
						<p>{error}</p>
					</div>
				) : versions.length === 0 ? (
					<div className="bg-gray-50 p-6 rounded-md text-center">
						<LucideIcons.FileQuestion className="w-12 h-12 text-gray-400 mx-auto mb-3" />
						<p className="text-gray-600">バージョン履歴がありません</p>
					</div>
				) : (
					<div className="grid grid-cols-3 gap-6">
						<div className="col-span-1 border rounded-md overflow-hidden">
							<div className="bg-gray-50 px-4 py-2 border-b">
								<h3 className="font-medium text-gray-700">バージョン一覧</h3>
							</div>
							<div className="max-h-[60vh] overflow-y-auto">
								<ul className="divide-y">
									{versions.map((version) => (
										<li
											key={version.id}
											onClick={() => setSelectedVersion(version)}
											className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
												selectedVersion?.id === version.id
													? "bg-blue-50 border-l-4 border-blue-500"
													: ""
											}`}
										>
											<div className="flex justify-between items-center">
												<span className="font-medium">v{version.version}</span>
												<span className="text-xs text-gray-500">
													{formatDate(version.created_at)}
												</span>
											</div>
											<p className="text-sm text-gray-600 truncate mt-1">
												{version.title}
											</p>
										</li>
									))}
								</ul>
							</div>
						</div>

						<div className="col-span-2 border rounded-md">
							{selectedVersion && (
								<div className="p-4 space-y-4">
									<div className="flex justify-between items-center pb-2 border-b">
										<h3 className="font-medium text-lg">
											v{selectedVersion.version} の詳細
										</h3>
										<span className="text-sm text-gray-500">
											{formatDate(selectedVersion.created_at)}
										</span>
									</div>

									<div>
										<h4 className="text-sm font-medium text-gray-500 mb-1">
											テストケース名
										</h4>
										<p className="text-gray-900">{selectedVersion.title}</p>
									</div>

									{selectedVersion.description && (
										<div>
											<h4 className="text-sm font-medium text-gray-500 mb-1">
												説明
											</h4>
											<p className="text-gray-900 whitespace-pre-line">
												{selectedVersion.description}
											</p>
										</div>
									)}

									{selectedVersion.preconditions && (
										<div>
											<h4 className="text-sm font-medium text-gray-500 mb-1">
												前提条件
											</h4>
											<p className="text-gray-900 whitespace-pre-line">
												{selectedVersion.preconditions}
											</p>
										</div>
									)}

									{selectedVersion.steps &&
										selectedVersion.steps.length > 0 && (
											<div>
												<h4 className="text-sm font-medium text-gray-500 mb-1">
													テストステップ
												</h4>
												<ol className="list-decimal list-inside space-y-1">
													{selectedVersion.steps.map((step, index) => (
														<li key={index} className="text-gray-900">
															{step}
														</li>
													))}
												</ol>
											</div>
										)}

									{selectedVersion.expected_result && (
										<div>
											<h4 className="text-sm font-medium text-gray-500 mb-1">
												期待結果
											</h4>
											<p className="text-gray-900 whitespace-pre-line">
												{selectedVersion.expected_result}
											</p>
										</div>
									)}

									{selectedVersion.priority && (
										<div>
											<h4 className="text-sm font-medium text-gray-500 mb-1">
												優先度
											</h4>
											<div className="flex items-center">
												<span
													className={`px-2 py-1 rounded text-xs font-medium ${
														selectedVersion.priority === "high"
															? "bg-red-100 text-red-800"
															: selectedVersion.priority === "medium"
																? "bg-yellow-100 text-yellow-800"
																: "bg-blue-100 text-blue-800"
													}`}
												>
													{selectedVersion.priority === "high"
														? "高"
														: selectedVersion.priority === "medium"
															? "中"
															: "低"}
												</span>
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				)}

				<div className="flex justify-end mt-4">
					<Button variant="outline" onClick={onClose}>
						閉じる
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default TestVersionsModal;
