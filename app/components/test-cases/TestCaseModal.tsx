import type { TestCase } from "@/app/stores/testSuiteStore";
import { Minus, Plus, X } from "lucide-react";
import { type FC, useEffect, useState } from "react";

interface TestCaseModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (
		data: Omit<TestCase, "id" | "status" | "lastExecuted" | "executionHistory">,
	) => void;
	initialData?: TestCase;
	mode: "create" | "edit";
}

const TestCaseModal: FC<TestCaseModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	initialData,
	mode,
}) => {
	const [steps, setSteps] = useState<string[]>([""]);

	useEffect(() => {
		if (initialData) {
			setSteps(initialData.steps || [""]);
		} else {
			setSteps([""]);
		}
	}, [initialData]);

	if (!isOpen) return null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);

		const filteredSteps = steps.filter((step) => step.trim() !== "");

		onSubmit({
			name: formData.get("name") as string,
			description: formData.get("description") as string,
			priority: formData.get("priority") as "high" | "medium" | "low",
			steps: filteredSteps,
			expectedResults: formData.get("expectedResults") as string,
		});
	};

	const addStep = () => {
		setSteps([...steps, ""]);
	};

	const removeStep = (index: number) => {
		setSteps(steps.filter((_, i) => i !== index));
	};

	const updateStep = (index: number, value: string) => {
		const newSteps = [...steps];
		newSteps[index] = value;
		setSteps(newSteps);
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-xl p-6 w-full max-w-2xl">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-xl font-semibold text-gray-900">
						{mode === "create" ? "新規テストケース作成" : "テストケース編集"}
					</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label
							htmlFor="name"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							テストケース名
						</label>
						<input
							type="text"
							id="name"
							name="name"
							defaultValue={initialData?.name}
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							説明
						</label>
						<textarea
							id="description"
							name="description"
							defaultValue={initialData?.description}
							rows={3}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					<div>
						<label
							htmlFor="priority"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							優先度
						</label>
						<select
							id="priority"
							name="priority"
							defaultValue={initialData?.priority || "medium"}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="high">高</option>
							<option value="medium">中</option>
							<option value="low">低</option>
						</select>
					</div>

					<div>
						<div className="flex justify-between items-center mb-2">
							<label className="block text-sm font-medium text-gray-700">
								テスト手順
							</label>
							<button
								type="button"
								onClick={addStep}
								className="text-blue-600 hover:text-blue-700"
							>
								<Plus className="w-4 h-4" />
							</button>
						</div>
						<div className="space-y-2">
							{steps.map((step, index) => (
								<div key={index} className="flex items-center space-x-2">
									<input
										type="text"
										value={step}
										onChange={(e) => updateStep(index, e.target.value)}
										className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										placeholder={`手順 ${index + 1}`}
									/>
									{steps.length > 1 && (
										<button
											type="button"
											onClick={() => removeStep(index)}
											className="text-red-600 hover:text-red-700"
										>
											<Minus className="w-4 h-4" />
										</button>
									)}
								</div>
							))}
						</div>
					</div>

					<div>
						<label
							htmlFor="expectedResults"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							期待される結果
						</label>
						<textarea
							id="expectedResults"
							name="expectedResults"
							defaultValue={initialData?.expectedResults}
							rows={3}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="期待される結果を入力してください"
						/>
					</div>

					<div className="flex justify-end space-x-3">
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
							{mode === "create" ? "作成" : "更新"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default TestCaseModal;
