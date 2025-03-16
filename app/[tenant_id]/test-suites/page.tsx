"use client";

import { Button } from "@components/ui/button";
import * as LucideIcons from "lucide-react";
import { useEffect, useState } from "react";
import ConfirmDialog from "@components/common/ConfirmDialog";
import MainLayout from "@components/layout/MainLayout";
import ExecuteTestModal from "@components/test-cases/ExecuteTestModal";
import TestCaseModal from "@components/test-cases/TestCaseModal";
import TestHistoryModal from "@components/test-cases/TestHistoryModal";
import TestVersionsModal from "@components/test-cases/TestVersionsModal";
import CreateSuiteModal from "@components/test-suites/CreateSuiteModal";
import useTestSuiteStore, {
  type TestSuite,
  type TestSuiteChild,
  type TestCase,
} from "@app/stores/testSuiteStore";
import { useParams } from "next/navigation";

export default function TestSuitesPage() {
  const params = useParams();
  const tenantId = params.tenant_id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tree" | "table">("tree");
  const [selectedSuiteId, setSelectedSuiteId] = useState<number | null>(null);
  const [expandedSuites, setExpandedSuites] = useState<number[]>([]);

  // モーダル表示状態
  const [showCreateSuiteModal, setShowCreateSuiteModal] = useState(false);
  const [showTestCaseModal, setShowTestCaseModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showVersionsModal, setShowVersionsModal] = useState(false);

  // 選択中のデータ
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(
    null
  );
  const [selectedChildSuite, setSelectedChildSuite] =
    useState<TestSuiteChild | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // useTestSuiteStore からメソッドを取得
  const {
    testSuites,
    setTestSuites,
    addTestSuite,
    addTestCase,
    updateTestCase,
    deleteTestCase,
    executeTestCase,
  } = useTestSuiteStore();

  // コンポーネントのマウント時にテストスイートを取得
  useEffect(() => {
    // モックデータやAPIからデータを取得する処理
    const fetchData = async () => {
      try {
        // ここでAPIリクエストを行う場合
        // const response = await fetch(`/api/tenants/${tenantId}/test-suites`);
        // const data = await response.json();
        // setTestSuites(data);

        // モックデータを使用する例
        const mockTestSuites: TestSuite[] = [
          {
            id: 1,
            name: "ログイン機能テスト",
            description: "ユーザーログイン機能のテストスイート",
            children: [
              {
                id: 101,
                name: "認証テスト",
                description: "ユーザー認証に関連するテスト",
                parentId: 1,
                testCases: [
                  {
                    id: 1001,
                    name: "有効な認証情報でのログイン",
                    description:
                      "正しいユーザー名とパスワードでログインできることを確認",
                    priority: "high",
                    status: "completed",
                    steps: [
                      "ログイン画面を開く",
                      "有効なユーザー名を入力",
                      "有効なパスワードを入力",
                      "ログインボタンをクリック",
                    ],
                    expectedResults: "ダッシュボードにリダイレクトされる",
                  },
                ],
              },
            ],
            testCases: [
              {
                id: 2001,
                name: "ログアウト機能",
                description: "ログアウト処理が正しく行われることを確認",
                priority: "medium",
                status: "not_started",
                steps: [
                  "ログイン状態でヘッダーのユーザーメニューを開く",
                  "ログアウトをクリック",
                ],
                expectedResults: "ログイン画面にリダイレクトされる",
              },
            ],
          },
        ];

        setTestSuites(mockTestSuites);
      } catch (error) {
        console.error("テストスイートの取得中にエラーが発生しました:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tenantId, setTestSuites]);

  // テストスイート作成ハンドラー
  const handleCreateSuite = async (data: {
    name: string;
    description: string;
    tenantId: string;
  }) => {
    // 実際の実装ではAPIリクエストを行う
    addTestSuite({
      name: data.name,
      description: data.description,
    });
  };

  // 省略...既存の処理を残しつつ、テナントIDを必要な箇所で利用する

  return (
    <MainLayout tenantId={tenantId}>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">テストスイート</h1>
          <Button onClick={() => setShowCreateSuiteModal(true)}>
            新規スイート作成
          </Button>
        </div>

        {/* タブナビゲーション */}
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 ${
              activeTab === "tree"
                ? "border-b-2 border-primary font-medium"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("tree")}
          >
            ツリー表示
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "table"
                ? "border-b-2 border-primary font-medium"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("table")}
          >
            テーブル表示
          </button>
        </div>

        {/* 以下、既存のコンポーネントはそのまま使用 */}
        {/* テストスイート表示エリア */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : testSuites.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700">
              テストスイートがありません
            </h3>
            <p className="text-gray-500 mt-2">
              「新規スイート作成」をクリックして最初のテストスイートを作成しましょう
            </p>
          </div>
        ) : (
          <div>
            {activeTab === "tree" && (
              <div className="space-y-4">
                {testSuites.map((suite) => (
                  <div
                    key={suite.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="bg-gray-50 p-4 cursor-pointer flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{suite.name}</h3>
                        <p className="text-sm text-gray-500">
                          {suite.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 各種モーダル */}
        {showCreateSuiteModal && (
          <CreateSuiteModal
            onSubmit={(data) => {
              // テナントIDを追加
              handleCreateSuite({ ...data, tenantId });
              setShowCreateSuiteModal(false);
            }}
            onCancel={() => setShowCreateSuiteModal(false)}
          />
        )}

        {/* 他のモーダルも同様に必要な箇所でテナントIDを追加 */}
        {/* 省略... */}
      </div>
    </MainLayout>
  );
}
