"use client";

import { getUserTenantsAction } from "@/app/actions/tenant";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type TenantInfo = {
  id: string;
  name: string;
  description?: string;
  role: string;
};

export default function TenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTenants = async () => {
      try {
        setLoading(true);
        const result = await getUserTenantsAction();

        if (result.success && result.data) {
          // データの整形
          const formattedTenants = result.data.map((item) => ({
            id: item.tenants?.id || "",
            name: item.tenants?.name || "Unknown",
            description: item.tenants?.description,
            role: item.role,
          }));

          setTenants(formattedTenants);

          // テナントが1つだけなら自動的にリダイレクト
          if (formattedTenants.length === 1) {
            router.push(`/${formattedTenants[0].id}/dashboard`);
            return;
          }

          // テナントがない場合は自動的にテナント作成ページへリダイレクト
          if (formattedTenants.length === 0) {
            router.push("/tenants/create");
            return;
          }
        } else {
          setError(result.error || "テナント情報を取得できませんでした");
        }
      } catch (err) {
        console.error("テナント取得エラー:", err);
        setError("テナント情報の取得中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    loadTenants();
  }, [router]);

  const handleTenantSelect = (tenantId: string) => {
    router.push(`/${tenantId}/dashboard`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">テナント情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
        <Button onClick={() => router.push("/sign-in")}>ログインに戻る</Button>
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center p-8 border rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-4">所属テナントがありません</h1>
          <p className="mb-6">
            テナントを作成するか、テナント管理者に招待を依頼してください。
          </p>
          <Button onClick={() => router.push("/tenants/create")}>
            新しいテナントを作成
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">テナント選択</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle>{tenant.name}</CardTitle>
              <CardDescription>
                {tenant.description || "説明がありません"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm bg-muted inline-block px-2 py-1 rounded">
                あなたの役割: {tenant.role}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleTenantSelect(tenant.id)}
              >
                選択
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button
          variant="outline"
          onClick={() => router.push("/tenants/create")}
        >
          新しいテナントを作成
        </Button>
      </div>
    </div>
  );
}
