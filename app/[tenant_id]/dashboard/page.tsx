import { getTenantDetails } from "@/lib/api/tenants";
import { redirect } from "next/navigation";
import MainLayout from "../../components/layout/MainLayout";

export default function DashboardPage({
  params,
}: {
  params: { tenant_id: string };
}) {
  const tenantId = params.tenant_id;

  try {
    // テナント情報を取得
    const tenant = await getTenantDetails(params.tenant_id);

    return (
      <MainLayout tenantId={tenantId}>
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-6">
            {tenant.name}のダッシュボード
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">テストスイート</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                テストスイートとテストケースを管理します
              </p>
              <a
                href={`/${params.tenant_id}/test-suites`}
                className="text-primary hover:underline"
              >
                テストスイート管理へ →
              </a>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">テナント設定</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                テナント情報やユーザー権限を管理します
              </p>
              <a
                href={`/${params.tenant_id}/settings`}
                className="text-primary hover:underline"
              >
                テナント設定へ →
              </a>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">チーム管理</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                チームとメンバーを管理します
              </p>
              <a
                href={`/${params.tenant_id}/teams`}
                className="text-primary hover:underline"
              >
                チーム管理へ →
              </a>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error("テナント情報取得エラー:", error);
    // エラーが発生した場合はテナント選択画面にリダイレクト
    redirect("/tenants");
  }
}
