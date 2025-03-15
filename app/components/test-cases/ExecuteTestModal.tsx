import { FC } from "react";
import {
  X,
  PlayCircle,
  CheckCircle,
  XCircle,
  Clock,
  SkipForward,
} from "lucide-react";
import { TestCase } from "@/app/stores/testSuiteStore";

interface ExecuteTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    status: "completed" | "failed" | "pending" | "skipped";
    comment: string;
  }) => void;
  testCase: TestCase;
}

const ExecuteTestModal: FC<ExecuteTestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  testCase,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    onSubmit({
      status: formData.get("status") as
        | "completed"
        | "failed"
        | "pending"
        | "skipped",
      comment: formData.get("comment") as string,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <PlayCircle className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              テストケース実行
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-gray-900">{testCase.name}</h3>
          <p className="text-gray-600 mt-1">{testCase.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">テスト手順</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              {testCase.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">期待される結果</h4>
            <p className="text-gray-600">{testCase.expectedResults}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              実行結果
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="status"
                  value="completed"
                  className="text-blue-600"
                  required
                />
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>成功</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="status"
                  value="failed"
                  className="text-blue-600"
                />
                <XCircle className="w-5 h-5 text-red-600" />
                <span>失敗</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="status"
                  value="pending"
                  className="text-blue-600"
                />
                <Clock className="w-5 h-5 text-yellow-600" />
                <span>保留</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="status"
                  value="skipped"
                  className="text-blue-600"
                />
                <SkipForward className="w-5 h-5 text-gray-600" />
                <span>スキップ</span>
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              コメント
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="実行結果に関するコメントを入力してください"
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
              実行結果を記録
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExecuteTestModal;
