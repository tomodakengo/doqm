import useTestSuiteStore, { TestSuite } from "@/app/stores/testSuiteStore";
import { X } from "lucide-react";
import type { FC } from "react";

interface CreateSuiteModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: {
		name: string;
		description: string;
		parentId?: number;
	}) => void;
}

const CreateSuiteModal: FC<CreateSuiteModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
}) => {
	const { testSuites } = useTestSuiteStore();

	if (!isOpen) return null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);

		const parentId = formData.get("parentId");
		onSubmit({
			name: formData.get("name") as string,
			description: formData.get("description") as string,
			parentId: parentId ? Number(parentId) : undefined,
		});
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-xl p-6 w-full max-w-md">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-xl font-semibold text-gray-900">
						新規スイート作成
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="parentId"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							親スイート
						</label>
						<select
							id="parentId"
							name="parentId"
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="">新規親スイートとして作成</option>
							{testSuites.map((suite) => (
								<option key={suite.id} value={suite.id}>
									{suite.name}の子スイートとして作成
								</option>
							))}
						</select>
					</div>

					<div>
						<label
							htmlFor="name"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							スイート名
						</label>
						<input
							type="text"
							id="name"
							name="name"
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="スイート名を入力"
						/>
					</div>

					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							説明
						</label>
						<textarea
							id="description"
							name="description"
							rows={3}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="スイートの説明を入力"
						/>
					</div>

					<div className="flex justify-end space-x-3 mt-6">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
						>
							キャンセル
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
						>
							作成
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CreateSuiteModal;
