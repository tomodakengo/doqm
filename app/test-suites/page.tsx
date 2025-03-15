"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTestSuiteHierarchy } from "@/lib/api/test-suite";
import { TestSuiteTree } from "@/app/components/test-suite/TestSuiteTree";
import { CreateTestSuiteModal } from "@/app/components/test-suite/CreateTestSuiteModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { TestSuite } from "@/lib/types/test-suite";

type TestSuiteWithChildren = TestSuite & {
  children: TestSuiteWithChildren[];
};

export default function TestSuitesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [suites, setSuites] = useState<TestSuiteWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // セッションの確認とデータの取得
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/sign-in");
        return;
      }

      try {
        const data = await getTestSuiteHierarchy();
        setSuites(data);
      } catch (error) {
        console.error("Failed to fetch test suites:", error);
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

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">テストスイート</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新規作成
        </Button>
      </div>
      <div className="border rounded-lg p-4">
        <TestSuiteTree suites={suites} />
      </div>

      <CreateTestSuiteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
