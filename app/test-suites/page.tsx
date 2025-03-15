"use client";

import MainLayout from "../components/layout/MainLayout";
import {
  Plus,
  FolderTree,
  ChevronRight,
  MoreVertical,
  File,
  Trash2,
  PlayCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import CreateSuiteModal from "../components/test-suites/CreateSuiteModal";
import TestCaseModal from "../components/test-cases/TestCaseModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import ExecuteTestModal from "../components/test-cases/ExecuteTestModal";
import useTestSuiteStore, {
  TestSuite,
  TestSuiteChild,
  TestCase,
} from "../stores/testSuiteStore";

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
        testCases: 12,
      },
      {
        id: 12,
        name: "パスワードリセット",
        description: "パスワードリセット機能のテストケース",
        testCases: 8,
      },
    ],
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
        testCases: 15,
      },
    ],
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

  // 初期データのロード
  useEffect(() => {
    setTestSuites(initialTestSuites);
  }, [setTestSuites]);

  // 選択されているスイートを取得
  const selectedSuite = testSuites.find(
    (suite) => suite.id === selectedSuiteId
  );

  const handleCreateSuite = (data: {
    name: string;
    description: string;
    parentId?: string;
  }) => {
    // 新しいスイートの作成処理
    const newSuite = {
      name: data.name,
      description: data.description,
      children: [],
    };
    useTestSuiteStore.getState().addTestSuite(newSuite);
    setCreateModalOpen(false);
  };

  // テストケースの作成・編集ハンドラー
  const handleTestCaseSubmit = (data: Omit<TestCase, "id">) => {
    if (selectedSuiteId) {
      if (testCaseModalMode === "create") {
        addTestCase(selectedSuiteId, data);
      } else if (editingTestCase) {
        updateTestCase(selectedSuiteId, editingTestCase.id, data);
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
      deleteTestCase(selectedSuiteId, deletingTestCase.id);
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
    status: "completed" | "failed";
    comment: string;
  }) => {
    if (selectedSuiteId && executingTestCase) {
      executeTestCase(selectedSuiteId, executingTestCase.id, data);
      setIsExecuteModalOpen(false);
      setExecutingTestCase(undefined);
    }
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
          <button
            onClick={() => setCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            新規スイート作成
          </button>
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-12 gap-6">
          {/* サイドバー：スイート一覧 */}
          <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-4">
              <FolderTree className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold text-gray-900">スイート一覧</h2>
            </div>
            <div className="space-y-2">
              {testSuites.map((suite: TestSuite) => (
                <div key={suite.id}>
                  <div
                    className={`flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer ${
                      selectedSuiteId === suite.id ? "bg-gray-50" : ""
                    }`}
                    onClick={() => selectSuite(suite.id)}
                  >
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{suite.name}</span>
                  </div>
                  <div className="ml-6 space-y-1">
                    {suite.children.map((child: TestSuiteChild) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <File className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{child.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {child.testCases}件
                        </span>
                      </div>
                    ))}
                  </div>
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
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedSuite.name}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {selectedSuite.description}
                    </p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500">総テストケース</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                      {selectedSuite.children.reduce(
                        (acc: number, child: TestSuiteChild) =>
                          acc + child.testCases,
                        0
                      )}
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500">実行済み</p>
                    <p className="text-2xl font-semibold text-green-600 mt-1">
                      15
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500">成功率</p>
                    <p className="text-2xl font-semibold text-blue-600 mt-1">
                      85%
                    </p>
                  </div>
                </div>
              </div>

              {/* テストケース一覧 */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">
                    テストケース一覧
                  </h3>
                  <button
                    onClick={handleCreateTestCase}
                    className="text-blue-600 hover:text-blue-700 inline-flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    テストケース追加
                  </button>
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
                    {(selectedSuite.testCases || []).map(
                      (testCase: TestCase, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
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
                              <button
                                onClick={() => handleExecuteClick(testCase)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <PlayCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditTestCase(testCase)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                編集
                              </button>
                              <button
                                onClick={() => handleDeleteClick(testCase)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
    </MainLayout>
  );
}
