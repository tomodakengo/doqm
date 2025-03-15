"use client";

import { FC, useState, useMemo } from "react";
import MainLayout from "../components/layout/MainLayout";
import {
  Search,
  Calendar,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  SkipForward,
} from "lucide-react";
import useTestSuiteStore, { TestCase } from "../stores/testSuiteStore";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

type ExecutionRecord = {
  testCase: TestCase;
  suiteName: string;
  childName?: string;
  date: string;
  status: "completed" | "failed" | "pending" | "skipped";
  comment: string;
};

const statusConfig = {
  completed: {
    icon: CheckCircle,
    text: "成功",
    className: "text-green-600",
    bgClassName: "bg-green-50",
  },
  failed: {
    icon: XCircle,
    text: "失敗",
    className: "text-red-600",
    bgClassName: "bg-red-50",
  },
  pending: {
    icon: Clock,
    text: "保留",
    className: "text-yellow-600",
    bgClassName: "bg-yellow-50",
  },
  skipped: {
    icon: SkipForward,
    text: "スキップ",
    className: "text-gray-600",
    bgClassName: "bg-gray-50",
  },
};

const HistoryPage: FC = () => {
  const { testSuites } = useTestSuiteStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedSuite, setSelectedSuite] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    start?: string;
    end?: string;
  }>({});

  // 全ての実行履歴を収集
  const allExecutions = useMemo(() => {
    const executions: ExecutionRecord[] = [];

    testSuites.forEach((suite) => {
      // 親スイートのテストケース
      suite.testCases?.forEach((testCase) => {
        testCase.executionHistory?.forEach((record) => {
          executions.push({
            testCase,
            suiteName: suite.name,
            date: record.date,
            status: record.status,
            comment: record.comment,
          });
        });
      });

      // 子スイートのテストケース
      suite.children.forEach((child) => {
        child.testCases?.forEach((testCase) => {
          testCase.executionHistory?.forEach((record) => {
            executions.push({
              testCase,
              suiteName: suite.name,
              childName: child.name,
              date: record.date,
              status: record.status,
              comment: record.comment,
            });
          });
        });
      });
    });

    return executions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [testSuites]);

  // フィルタリングされた実行履歴
  const filteredExecutions = useMemo(() => {
    return allExecutions.filter((execution) => {
      // 検索クエリでフィルタリング
      if (
        searchQuery &&
        !execution.testCase.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) &&
        !execution.comment.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // ステータスでフィルタリング
      if (
        selectedStatus.length > 0 &&
        !selectedStatus.includes(execution.status)
      ) {
        return false;
      }

      // スイートでフィルタリング
      if (selectedSuite && execution.suiteName !== selectedSuite) {
        return false;
      }

      // 日付範囲でフィルタリング
      if (
        dateRange.start &&
        new Date(execution.date) < new Date(dateRange.start)
      ) {
        return false;
      }
      if (dateRange.end && new Date(execution.date) > new Date(dateRange.end)) {
        return false;
      }

      return true;
    });
  }, [allExecutions, searchQuery, selectedStatus, selectedSuite, dateRange]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">実行履歴</h1>
            <p className="text-gray-600 mt-1">
              テストケースの実行履歴を確認・検索
            </p>
          </div>
        </div>

        {/* フィルターセクション */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-4 gap-4">
            {/* 検索ボックス */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                検索
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="テストケース名やコメントで検索"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* 日付範囲 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始日
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dateRange.start || ""}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了日
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dateRange.end || ""}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* スイート選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                スイート
              </label>
              <select
                value={selectedSuite}
                onChange={(e) => setSelectedSuite(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">全て</option>
                {testSuites.map((suite) => (
                  <option key={suite.id} value={suite.name}>
                    {suite.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ステータスフィルター */}
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス
              </label>
              <div className="flex space-x-3">
                {Object.entries(statusConfig).map(([key, value]) => {
                  const Icon = value.icon;
                  const isSelected = selectedStatus.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() =>
                        setSelectedStatus((prev) =>
                          isSelected
                            ? prev.filter((s) => s !== key)
                            : [...prev, key]
                        )
                      }
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                        isSelected
                          ? `${value.bgClassName} ${value.className} border-current`
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{value.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 実行履歴一覧 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">実行結果</h3>
              <span className="text-gray-500">
                {filteredExecutions.length}件の結果
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredExecutions.map((execution, index) => {
              const status = statusConfig[execution.status];
              const StatusIcon = status.icon;
              return (
                <div key={index} className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <StatusIcon className={`w-5 h-5 ${status.className}`} />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {execution.testCase.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {execution.suiteName}
                          {execution.childName && ` > ${execution.childName}`}
                        </p>
                      </div>
                    </div>
                    <time className="text-sm text-gray-500">
                      {format(
                        new Date(execution.date),
                        "yyyy年MM月dd日 HH:mm",
                        {
                          locale: ja,
                        }
                      )}
                    </time>
                  </div>
                  {execution.comment && (
                    <div className="mt-2 text-gray-600 bg-gray-50 rounded-lg p-3">
                      {execution.comment}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HistoryPage;
