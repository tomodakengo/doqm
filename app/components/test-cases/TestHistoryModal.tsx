import type { TestCase } from "@/app/stores/testSuiteStore";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { CheckCircle, Clock, SkipForward, X, XCircle } from "lucide-react";
import type { FC } from "react";

interface TestHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  testCase: TestCase;
}

const statusConfig = {
  completed: {
    icon: CheckCircle,
    text: "成功",
    className: "text-green-600",
  },
  failed: {
    icon: XCircle,
    text: "失敗",
    className: "text-red-600",
  },
  pending: {
    icon: Clock,
    text: "保留",
    className: "text-yellow-600",
  },
  skipped: {
    icon: SkipForward,
    text: "スキップ",
    className: "text-gray-600",
  },
};

const TestHistoryModal: FC<TestHistoryModalProps> = ({
  isOpen,
  onClose,
  testCase,
}) => {
  if (!isOpen) return null;

  const history = testCase.executionHistory || [];
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">実行履歴</h2>
            <p className="text-gray-600 mt-1">{testCase.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sortedHistory.length > 0 ? (
            <div className="space-y-4">
              {sortedHistory.map((record, index) => {
                const status = statusConfig[record.status];
                const StatusIcon = status.icon;
                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`w-5 h-5 ${status.className}`} />
                        <span className={`font-medium ${status.className}`}>
                          {status.text}
                        </span>
                      </div>
                      <time className="text-sm text-gray-500">
                        {format(new Date(record.date), "yyyy年MM月dd日 HH:mm", {
                          locale: ja,
                        })}
                      </time>
                    </div>
                    {record.comment && (
                      <div className="mt-2 text-gray-600 bg-gray-50 rounded-lg p-3">
                        {record.comment}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              実行履歴がありません
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestHistoryModal;
