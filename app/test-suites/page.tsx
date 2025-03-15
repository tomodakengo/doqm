"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTestSuiteHierarchy } from "@/lib/api/test-suite";
import { TestSuiteTree } from "../components/test-suites/TestSuiteTree";
import CreateSuiteModal from "../components/test-suites/CreateSuiteModal";
import { Button } from "@/components/ui/button";
import { Plus, PlayCircle, History, Pencil, Trash } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { TestSuite } from "@/lib/types/test-suite";
import { TestCase } from "@/lib/types/test-case";
import MainLayout from "../components/layout/MainLayout";
import TestCaseModal from "../components/test-cases/TestCaseModal";
import ExecuteTestModal from "../components/test-cases/ExecuteTestModal";
import TestHistoryModal from "../components/test-cases/TestHistoryModal";

type TestSuiteWithChildren = TestSuite & {
  children: TestSuiteWithChildren[];
};

export default function TestSuitesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTestCaseModalOpen, setIsTestCaseModalOpen] = useState(false);
  const [isExecuteModalOpen, setIsExecuteModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [suites, setSuites] = useState<TestSuiteWithChildren[]>([]);
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  const [selectedTestCase, setSelectedTestCase] = useState<
    TestCase | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // セッションの確認とデータの取得
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/sign-in");
          return;
        }

        const data = await getTestSuiteHierarchy();
        setSuites(data);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch test suites:", error);
        setError("テストスイートの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router, supabase.auth]);

  const handleCreateSuccess = (newSuite: TestSuite) => {
    setSuites((prev) => [...prev, { ...newSuite, children: [] }]);
    setIsCreateModalOpen(false);
  };

  const handleCreateTestCase = (
    data: Omit<TestCase, "id" | "status" | "lastExecuted" | "executionHistory">
  ) => {
    // TODO: Implement test case creation
    setIsTestCaseModalOpen(false);
  };

  const handleExecuteTest = (result: {
    status: "completed" | "failed" | "pending" | "skipped";
    comment: string;
  }) => {
    // TODO: Implement test execution
    setIsExecuteModalOpen(false);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-lg">読み込み中...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">テストスイート</h1>
            <p className="text-gray-600 mt-1">テストスイートの管理と実行</p>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">テストスイート</h1>
            <p className="text-gray-600 mt-1">テストスイートの管理と実行</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新規スイート
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* テストスイートツリー */}
          <div className="col-span-4 bg-white rounded-xl border border-gray-200 p-6">
            <TestSuiteTree
              suites={suites}
              onSelect={setSelectedSuite}
              selectedId={selectedSuite?.id}
            />
          </div>

          {/* テストケース一覧 */}
          <div className="col-span-8 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedSuite
                  ? `${selectedSuite.name} のテストケース`
                  : "テストケース"}
              </h2>
              {selectedSuite && (
                <Button onClick={() => setIsTestCaseModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  新規テストケース
                </Button>
              )}
            </div>

            {selectedSuite ? (
              <div className="divide-y divide-gray-200">
                {selectedSuite.test_cases?.map((testCase) => (
                  <div
                    key={testCase.id}
                    className="py-4 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {testCase.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {testCase.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTestCase(testCase);
                          setIsExecuteModalOpen(true);
                        }}
                      >
                        <PlayCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTestCase(testCase);
                          setIsHistoryModalOpen(true);
                        }}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTestCase(testCase);
                          setIsTestCaseModalOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement delete
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                左側のツリーからテストスイートを選択してください
              </div>
            )}
          </div>
        </div>

        <TestCaseModal
          isOpen={isTestCaseModalOpen}
          onClose={() => setIsTestCaseModalOpen(false)}
          onSubmit={handleCreateTestCase}
          initialData={selectedTestCase}
          mode={selectedTestCase ? "edit" : "create"}
        />

        {selectedTestCase && (
          <>
            <ExecuteTestModal
              isOpen={isExecuteModalOpen}
              onClose={() => setIsExecuteModalOpen(false)}
              onSubmit={handleExecuteTest}
              testCase={selectedTestCase}
            />

            <TestHistoryModal
              isOpen={isHistoryModalOpen}
              onClose={() => setIsHistoryModalOpen(false)}
              testCase={selectedTestCase}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
}
