"use client";

import * as LucideIcons from "lucide-react";
import { useEffect, useState } from "react";
import ConfirmDialog from "../components/common/ConfirmDialog";
import MainLayout from "../components/layout/MainLayout";
import ExecuteTestModal from "../components/test-cases/ExecuteTestModal";
import TestCaseModal from "../components/test-cases/TestCaseModal";
import TestHistoryModal from "../components/test-cases/TestHistoryModal";
import CreateSuiteModal from "../components/test-suites/CreateSuiteModal";
import useTestSuiteStore, {
  type TestSuite,
  type TestSuiteChild,
  type TestCase,
} from "../stores/testSuiteStore";
import { Button } from "@/components/ui/button";

// 初期データ
const initialTestSuites: TestSuite[] = [
  {
    id: 1,
    name: "認証機能テスト",
    description: "ユーザー認証に関連するテストスイート",
    children: [
      {
        id: 11,
        name: "ログイン機能",
        description: "ユーザーログインに関するテストケース",
        testCases: [],
        parentId: 1,
      },
      {
        id: 12,
        name: "パスワードリセット",
        description: "パスワードリセット機能のテストケース",
        testCases: [],
        parentId: 1,
      },
    ],
    testCases: [],
  },
  {
    id: 2,
    name: "ユーザー管理機能",
    description: "ユーザー情報管理に関するテストスイート",
    children: [
      {
        id: 21,
        name: "プロフィール編集",
        description: "ユーザープロフィール編集機能のテストケース",
        testCases: [],
        parentId: 2,
      },
    ],
    testCases: [],
  },
];

// ステータスに応じた表示テキストとスタイルを定義
const statusConfig = {
  not_started: {
    text: "未実行",
    className: "bg-gray-100 text-gray-800",
  },
  in_progress: {
    text: "実行中",
    className: "bg-yellow-100 text-yellow-800",
  },
  completed: {
    text: "成功",
    className: "bg-green-100 text-green-800",
  },
  failed: {
    text: "失敗",
    className: "bg-red-100 text-red-800",
  },
  pending: {
    text: "保留",
    className: "bg-orange-100 text-orange-800",
  },
  skipped: {
    text: "スキップ",
    className: "bg-gray-100 text-gray-600",
  },
};

export default function TestSuitesPage() {
  const {
    testSuites,
    selectedSuiteId,
    selectedChildId,
    isCreateModalOpen,
    setTestSuites,
    selectSuite,
    setCreateModalOpen,
    addTestCase,
    updateTestCase,
    deleteTestCase,
    executeTestCase,
  } = useTestSuiteStore();

  // テストケースモーダルの状態
  const [isTestCaseModalOpen, setIsTestCaseModalOpen] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<
    TestCase | undefined
  >();
  const [testCaseModalMode, setTestCaseModalMode] = useState<"create" | "edit">(
    "create"
  );

  // 削除確認モーダルの状態
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTestCase, setDeletingTestCase] = useState<
    TestCase | undefined
  >();

  // テストケース実行モーダルの状態
  const [isExecuteModalOpen, setIsExecuteModalOpen] = useState(false);
  const [executingTestCase, setExecutingTestCase] = useState<
    TestCase | undefined
  >();

  // スイートの展開/折りたたみを切り替える
  const [expandedSuites, setExpandedSuites] = useState<number[]>([]);

  // 履歴モーダルの状態
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistoryTestCase, setSelectedHistoryTestCase] = useState<
    TestCase | undefined
  >();

  // 初期データのロード
  useEffect(() => {
    setTestSuites(initialTestSuites);
  }, [setTestSuites]);

  // 選択されているスイートを取得
  const selectedSuite = testSuites.find(
    (suite) => suite.id === selectedSuiteId
  );

  // スイートの展開/折りたたみを切り替える
  const toggleSuiteExpansion = (suiteId: number) => {
    setExpandedSuites((prev) =>
      prev.includes(suiteId)
        ? prev.filter((id) => id !== suiteId)
        : [...prev, suiteId]
    );
  };

  // 選択されているスイートまたは子スイートを取得
  const getSelectedTestCase = (): TestCase[] => {
    const suite = testSuites.find((s) => s.id === selectedSuiteId);
    if (!suite) return [];

    if (selectedChildId) {
      const child = suite.children.find((c) => c.id === selectedChildId);
      return child?.testCases || [];
    }
    return suite.testCases || [];
  };

  // 選択されているスイートまたは子スイートのテストケース数を取得
  const getTestCaseCount = (child: TestSuiteChild): number => {
    if (!child.testCases) return 0;
    return child.testCases.length;
  };

  // 選択されているスイートまたは子スイートの情報を取得
  const getSelectedSuiteInfo = () => {
    const suite = testSuites.find((s) => s.id === selectedSuiteId);
    if (!suite) return null;

    if (selectedChildId) {
      const child = suite.children.find((c) => c.id === selectedChildId);
      if (child) {
        return {
          name: child.name,
          description: child.description,
          testCases: child.testCases || [],
        };
      }
    }
    return {
      name: suite.name,
      description: suite.description,
      testCases: suite.testCases || [],
    };
  };

  // テストケースの統計情報を計算
  const calculateTestStats = (testCases: TestCase[]) => {
    const totalTests = testCases.length;
    const executedTests = testCases.filter((tc) => tc.lastExecuted).length;
    const successfulTests = testCases.filter(
      (tc) => tc.status === "completed"
    ).length;
    const successRate =
      totalTests > 0 ? Math.round((successfulTests / totalTests) * 100) : 0;

    return {
      totalTests,
      executedTests,
      successRate,
    };
  };

  const handleCreateSuite = (data: {
    name: string;
    description: string;
    parentId?: number;
  }) => {
    const newSuite = {
      name: data.name,
      description: data.description,
      parentId: data.parentId,
    };
    useTestSuiteStore.getState().addTestSuite(newSuite);
    setCreateModalOpen(false);
  };

  // テストケースの作成・編集ハンドラー
  const handleTestCaseSubmit = (
    data: Omit<TestCase, "id" | "status" | "lastExecuted" | "executionHistory">
  ) => {
    if (selectedSuiteId) {
      if (testCaseModalMode === "create") {
        addTestCase(selectedSuiteId, selectedChildId, data);
      } else if (editingTestCase) {
        updateTestCase(
          selectedSuiteId,
          selectedChildId,
          editingTestCase.id,
          data
        );
      }
      setIsTestCaseModalOpen(false);
      setEditingTestCase(undefined);
    }
  };

  // テストケース編集モーダルを開く
  const handleEditTestCase = (testCase: TestCase) => {
    setEditingTestCase(testCase);
    setTestCaseModalMode("edit");
    setIsTestCaseModalOpen(true);
  };

  // テストケース作成モーダルを開く
  const handleCreateTestCase = () => {
    setEditingTestCase(undefined);
    setTestCaseModalMode("create");
    setIsTestCaseModalOpen(true);
  };

  // テストケース削除の確認モーダルを開く
  const handleDeleteClick = (testCase: TestCase) => {
    setDeletingTestCase(testCase);
    setIsDeleteModalOpen(true);
  };

  // テストケースの削除を実行
  const handleDeleteConfirm = () => {
    if (selectedSuiteId && deletingTestCase) {
      deleteTestCase(selectedSuiteId, selectedChildId, deletingTestCase.id);
      setIsDeleteModalOpen(false);
      setDeletingTestCase(undefined);
    }
  };

  // テストケース実行モーダルを開く
  const handleExecuteClick = (testCase: TestCase) => {
    setExecutingTestCase(testCase);
    setIsExecuteModalOpen(true);
  };

  // テストケース実行結果を記録
  const handleExecuteSubmit = (data: {
    status: "completed" | "failed" | "pending" | "skipped";
    comment: string;
  }) => {
    if (selectedSuiteId && executingTestCase) {
      executeTestCase(
        selectedSuiteId,
        selectedChildId,
        executingTestCase.id,
        data
      );
      setIsExecuteModalOpen(false);
      setExecutingTestCase(undefined);
    }
  };

  // 履歴モーダルを開く
  const handleHistoryClick = (testCase: TestCase) => {
    setSelectedHistoryTestCase(testCase);
    setIsHistoryModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ヘッダー部分 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">テストスイート</h1>
            <p className="text-gray-600 mt-1">
              テストスイートとテストケースの管理
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <LucideIcons.Plus className="w-5 h-5 mr-2" />
            新規スイート作成
          </Button>
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-12 gap-6">
          {/* サイドバー：スイート一覧 */}
          <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-4">
              <LucideIcons.FolderTree className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold text-gray-900">スイート一覧</h2>
            </div>
            <div className="space-y-2">
              {testSuites.map((suite: TestSuite) => (
                <div key={suite.id}>
                  <div
                    className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer ${
                      selectedSuiteId === suite.id && !selectedChildId
                        ? "bg-gray-50"
                        : ""
                    }`}
                  >
                    <div
                      className="flex items-center space-x-2 flex-1"
                      onClick={() => selectSuite(suite.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          selectSuite(suite.id);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                    >
                      <span className="text-gray-700">{suite.name}</span>
                    </div>
                    {suite.children.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSuiteExpansion(suite.id);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedSuites.includes(suite.id) ? (
                          <LucideIcons.ChevronDown className="w-4 h-4" />
                        ) : (
                          <LucideIcons.ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                  {expandedSuites.includes(suite.id) && (
                    <div className="ml-6 space-y-1">
                      {suite.children.map((child: TestSuiteChild) => (
                        <div
                          key={child.id}
                          className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer ${
                            selectedChildId === child.id ? "bg-gray-50" : ""
                          }`}
                          onClick={() => selectSuite(suite.id, child.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              selectSuite(suite.id, child.id);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                        >
                          <div className="flex items-center space-x-2">
                            <LucideIcons.File className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{child.name}</span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {getTestCaseCount(child)}件
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* メインエリア：スイート詳細 */}
          {selectedSuite ? (
            <div className="col-span-9 space-y-6">
              {/* スイート情報 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    {/* 選択中のスイートまたは子スイートの情報を表示 */}
                    {(() => {
                      const info = getSelectedSuiteInfo();
                      return info ? (
                        <>
                          <h2 className="text-xl font-semibold text-gray-900">
                            {info.name}
                          </h2>
                          <p className="text-gray-600 mt-1">
                            {info.description}
                          </p>
                        </>
                      ) : null;
                    })()}
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <LucideIcons.MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {(() => {
                    const info = getSelectedSuiteInfo();
                    const stats = info
                      ? calculateTestStats(info.testCases)
                      : { totalTests: 0, executedTests: 0, successRate: 0 };
                    return (
                      <>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <p className="text-sm text-gray-500">
                            総テストケース
                          </p>
                          <p className="text-2xl font-semibold text-gray-900 mt-1">
                            {stats.totalTests}
                          </p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <p className="text-sm text-gray-500">実行済み</p>
                          <p className="text-2xl font-semibold text-green-600 mt-1">
                            {stats.executedTests}
                          </p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <p className="text-sm text-gray-500">成功率</p>
                          <p className="text-2xl font-semibold text-blue-600 mt-1">
                            {stats.successRate}%
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* テストケース一覧 */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">
                    テストケース一覧
                  </h3>
                  <Button onClick={handleCreateTestCase} variant="link">
                    <LucideIcons.Plus className="w-4 h-4 mr-1" />
                    テストケース追加
                  </Button>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        テストケース名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        優先度
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ステータス
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        最終実行
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        アクション
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getSelectedTestCase().map(
                      (testCase: TestCase, index: number) => (
                        <tr key={testCase.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {testCase.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {testCase.description}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                testCase.priority === "high"
                                  ? "bg-red-100 text-red-800"
                                  : testCase.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                              }`}
                            >
                              {testCase.priority === "high"
                                ? "高"
                                : testCase.priority === "medium"
                                  ? "中"
                                  : "低"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                statusConfig[testCase.status].className
                              }`}
                            >
                              {statusConfig[testCase.status].text}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {testCase.lastExecuted || "-"}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3">
                              <Button
                                onClick={() => handleExecuteClick(testCase)}
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-900"
                              >
                                <LucideIcons.PlayCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleHistoryClick(testCase)}
                                variant="ghost"
                                size="icon"
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <LucideIcons.History className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleEditTestCase(testCase)}
                                variant="ghost"
                                className="text-blue-600 hover:text-blue-900"
                              >
                                編集
                              </Button>
                              <Button
                                onClick={() => handleDeleteClick(testCase)}
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-900"
                              >
                                <LucideIcons.Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="col-span-9 flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500">
                左のサイドバーからテストスイートを選択してください
              </p>
            </div>
          )}
        </div>
      </div>

      <CreateSuiteModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSuite}
      />

      <TestCaseModal
        isOpen={isTestCaseModalOpen}
        onClose={() => {
          setIsTestCaseModalOpen(false);
          setEditingTestCase(undefined);
        }}
        onSubmit={handleTestCaseSubmit}
        initialData={editingTestCase}
        mode={testCaseModalMode}
      />

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingTestCase(undefined);
        }}
        onConfirm={handleDeleteConfirm}
        title="テストケースの削除"
        message={`「${deletingTestCase?.name}」を削除してもよろしいですか？この操作は取り消せません。`}
        type="danger"
      />

      <ExecuteTestModal
        isOpen={isExecuteModalOpen}
        onClose={() => {
          setIsExecuteModalOpen(false);
          setExecutingTestCase(undefined);
        }}
        onSubmit={handleExecuteSubmit}
        testCase={executingTestCase as TestCase}
      />

      <TestHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedHistoryTestCase(undefined);
        }}
        testCase={selectedHistoryTestCase as TestCase}
      />
    </MainLayout>
  );
}
