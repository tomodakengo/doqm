"use client";

import { Button } from "@/app/components/ui/button";
import * as LucideIcons from "lucide-react";
import { useEffect, useState } from "react";
import ConfirmDialog from "@/app/components/common/ConfirmDialog";
import MainLayout from "@/app/components/layout/MainLayout";
import ExecuteTestModal from "@/app/components/test-cases/ExecuteTestModal";
import TestCaseModal from "@/app/components/test-cases/TestCaseModal";
import TestHistoryModal from "@/app/components/test-cases/TestHistoryModal";
import TestVersionsModal from "@/app/components/test-cases/TestVersionsModal";
import CreateSuiteModal from "@/app/components/test-suites/CreateSuiteModal";
import useTestSuiteStore, {
  type TestSuite,
  type TestSuiteChild,
  type TestCase,
} from "@/app/stores/testSuiteStore";
import { useParams } from "next/navigation";

export default function TestSuitesPage({
  params,
}: {
  params: { tenant_id: string };
}) {
  const tenantId = params.tenant_id;
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
    fetchTestSuites,
    addTestSuite,
    addTestCase,
    updateTestCase,
    deleteTestCase,
    executeTest,
  } = useTestSuiteStore();

  // コンポーネントのマウント時にテストスイートを取得
  useEffect(() => {
    // テナントIDをパラメータとして追加
    fetchTestSuites(tenantId).then(() => {
      setIsLoading(false);
    });
  }, [fetchTestSuites, tenantId]);

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
        {/* 省略... */}

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
