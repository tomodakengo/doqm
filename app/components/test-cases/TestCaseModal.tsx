import { FC, useEffect } from "react";
import { X } from "lucide-react";
import { TestCase } from "@/app/stores/testSuiteStore";

interface TestCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<TestCase, "id">) => void;
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
  useEffect(() => {
    if (isOpen && initialData && mode === "edit") {
      const form = document.getElementById("testCaseForm") as HTMLFormElement;
      if (form) {
        const nameInput = form.querySelector<HTMLInputElement>("#name");
        const descriptionInput =
          form.querySelector<HTMLTextAreaElement>("#description");
        const prioritySelect =
          form.querySelector<HTMLSelectElement>("#priority");
        const statusSelect = form.querySelector<HTMLSelectElement>("#status");

        if (nameInput) nameInput.value = initialData.name;
        if (descriptionInput) descriptionInput.value = initialData.description;
        if (prioritySelect) prioritySelect.value = initialData.priority;
        if (statusSelect) statusSelect.value = initialData.status;
      }
    }
  }, [isOpen, initialData, mode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const status = formData.get("status") as
      | "not_started"
      | "in_progress"
      | "completed"
      | "failed";

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      priority: formData.get("priority") as "high" | "medium" | "low",
      status: status,
    };

    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "create" ? "テストケース作成" : "テストケース編集"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="testCaseForm" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              テストケース名
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={initialData?.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="テストケース名を入力"
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
              defaultValue={initialData?.description}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="テストケースの説明を入力"
            />
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              優先度
            </label>
            <select
              id="priority"
              name="priority"
              required
              defaultValue={initialData?.priority || "medium"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ステータス
            </label>
            <select
              id="status"
              name="status"
              required
              defaultValue={initialData?.status || "not_started"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="not_started">未実行</option>
              <option value="in_progress">実行中</option>
              <option value="completed">成功</option>
              <option value="failed">失敗</option>
            </select>
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
              {mode === "create" ? "作成" : "更新"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestCaseModal;
